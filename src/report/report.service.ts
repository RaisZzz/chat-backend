import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SendReportDto } from './dto/send-report.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Report } from './report.model';
import { excludedUserAttributes, User } from '../user/user.model';
import { Chat } from '../chat/chat.model';
import { Op } from 'sequelize';
import { ChatService } from '../chat/chat.service';
import { AnswerReportDto } from './dto/answer-report.dto';
import { Sequelize } from 'sequelize-typescript';
import { StatisticFilterDto } from '../statistic/dto/statistic-filter.dto';
import { SetResolvedDto } from './dto/set-resolved.dto';
import { GetReportsDto } from './dto/get.dto';
import { SocketGateway } from 'src/websockets/socket.gateway';
import { Role } from 'src/role/role.model';
import { Error, ErrorType } from '../error.class';
import { UserReactionService } from '../user-reaction/user-reaction.service';

export class ReportsStat {
  readonly totalReports: number;
  readonly monthlyReports: number;
  readonly totalUnresolved: number;
  readonly monthlyUnresolved: number;
  readonly totalResolved: number;
  readonly monthlyResolved: number;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report) private reportRepository: typeof Report,
    @InjectModel(User) private userRepository: typeof User,
    private chatService: ChatService,
    private userReactionService: UserReactionService,
    private readonly sequelize: Sequelize,
    private socketGateway: SocketGateway,
  ) {}

  async send(user: User, sendDto: SendReportDto): Promise<Report> {
    // Check that reported user not equal
    if (user.id === sendDto.reportedId) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'reportedId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check that reported user exist
    const reportedUser = await this.userRepository.count({
      where: { id: sendDto.reportedId },
    });
    if (!reportedUser || user.id === sendDto.reportedId) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'reportedId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if report doesn't already exist
    const reportExist = await this.reportRepository.count({
      where: { ownerId: user.id, reportedId: sendDto.reportedId },
    });
    if (reportExist) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { info: 'Report already exist' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Set dislike to reported user
    await this.userReactionService.send(user, {
      toUserId: sendDto.reportedId,
      isLiked: false,
    });

    // Get and delete chat if exist
    const chat: Chat = await this.chatService.getChatWithTwoUsers(
      user.id,
      sendDto.reportedId,
    );
    if (chat) await this.chatService.deleteChat(chat.id);

    const report: Report = await this.reportRepository.create({
      ...sendDto,
      ownerId: user.id,
    });

    const admin: User = await this.userRepository.findOne({
      include: [
        {
          model: Role,
          where: {
            value: 'admin',
          },
        },
      ],
    });
    if (admin) {
      this.reportRepository
        .findOne({
          where: { id: report.id },
          include: [
            {
              model: User,
              as: 'owner',
              attributes: { exclude: excludedUserAttributes },
            },
            {
              model: User,
              as: 'reported',
              attributes: { exclude: excludedUserAttributes },
            },
          ],
        })
        .then((newReport: Report) =>
          this.socketGateway.sendReport(admin.id, newReport),
        );
    }

    return report;
  }

  async getAll(filterDto: GetReportsDto): Promise<Report[]> {
    const reportsWhere = {};
    const userWhere = {};

    const searchingReportId = parseInt(filterDto.search);
    if (searchingReportId) {
      reportsWhere['id'] = searchingReportId;
    }

    if ([true, false].includes(filterDto.showUnresolved)) {
      reportsWhere['resolved'] = !filterDto.showUnresolved;
    }

    if (filterDto.startDate) {
      reportsWhere['createdAt'] = {
        [Op.gte]: filterDto.startDate.toISOString(),
      };
    }

    if ([0, 1].includes(filterDto.sex)) {
      userWhere['sex'] = filterDto.sex;
    }

    if (Array.isArray(filterDto.livePlaceId) && filterDto.livePlaceId.length) {
      userWhere['livePlaceId'] = {
        [Op.in]: filterDto.livePlaceId,
      };
    }

    return await this.reportRepository.findAll({
      where: reportsWhere,
      offset: filterDto.offset,
      limit: 20,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: { exclude: excludedUserAttributes },
        },
        {
          model: User,
          as: 'reported',
          attributes: { exclude: excludedUserAttributes },
          where: userWhere,
        },
      ],
      order: [
        ['answer', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  async answerReport(user: User, answerDto: AnswerReportDto): Promise<Report> {
    const report: Report = await this.reportRepository.findOne({
      where: {
        id: answerDto.reportId,
      },
    });

    if (!report) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'reportId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    await report.update({
      answer: answerDto.answer,
    });

    // TODO: Send support message

    return report;
  }

  async setResolved(resolvedDto: SetResolvedDto): Promise<Report> {
    const report: Report = await this.reportRepository.findOne({
      where: {
        id: resolvedDto.reportId,
      },
    });

    if (!report) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'reportId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    await report.update({ resolved: resolvedDto.resolved });

    return report;
  }

  async getStatistic(filterDto: StatisticFilterDto): Promise<ReportsStat> {
    const genderFilter: string = [0, 1].includes(filterDto.sex)
      ? `AND (
        SELECT sex FROM "user"
        WHERE id = report.reported_id
      ) = ${filterDto.sex}`
      : '';

    const livePlaceFilter: string =
      Array.isArray(filterDto.livePlaceId) && filterDto.livePlaceId.length
        ? `AND (
        SELECT live_place_id FROM "user"
        WHERE id = report.reported_id
      ) IN (${filterDto.livePlaceId})`
        : '';

    const dateFilter: string = filterDto.startDate
      ? `
      AND created_at >= '${filterDto.startDate.toISOString()}'
    `
      : '';

    const filter = `
      ${genderFilter}
      ${livePlaceFilter}
    `;

    let totalReports = 0;
    let monthlyReports = 0;
    let totalUnresolved = 0;
    let monthlyUnresolved = 0;
    let totalResolved = 0;
    let monthlyResolved = 0;

    const today: Date = new Date();
    const month: number = today.getMonth() + 1;
    const year: number = today.getFullYear();

    const startMonthString = `${year}-${month}-01`;
    const monthlyQuery = `created_at >= '${startMonthString}'`;

    const [response] = await this.sequelize.query(`SELECT
        (SELECT COUNT(*) FROM report WHERE true ${filter} ${dateFilter}) "totalReports",
        (SELECT COUNT(*) FROM report WHERE resolved = true ${filter} ${dateFilter}) "totalResolved",
        (SELECT COUNT(*) FROM report WHERE resolved = false ${filter} ${dateFilter}) "totalUnresolved",
        (SELECT COUNT(*) FROM report WHERE ${monthlyQuery} ${filter}) "monthlyReports",
        (SELECT COUNT(*) FROM report WHERE resolved = true AND ${monthlyQuery} ${filter}) "monthlyResolved",
        (SELECT COUNT(*) FROM report WHERE resolved = false AND ${monthlyQuery} ${filter}) "monthlyUnresolved"
    `);

    if (response.length) {
      totalReports = parseInt(response[0]['totalReports']) || 0;
      monthlyReports = parseInt(response[0]['monthlyReports']) || 0;
      totalUnresolved = parseInt(response[0]['totalUnresolved']) || 0;
      monthlyUnresolved = parseInt(response[0]['monthlyUnresolved']) || 0;
      totalResolved = parseInt(response[0]['totalResolved']) || 0;
      monthlyResolved = parseInt(response[0]['monthlyResolved']) || 0;
    }

    return {
      totalReports,
      monthlyReports,
      totalUnresolved,
      monthlyUnresolved,
      totalResolved,
      monthlyResolved,
    };
  }
}
