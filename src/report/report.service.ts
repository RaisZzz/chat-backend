import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SendReportDto } from './dto/send-report.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Report } from './report.model';
import {
  excludedUserAttributes,
  User,
  userAdditionalInfoQuery,
} from '../user/user.model';
import { Chat, ChatType } from '../chat/chat.model';
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
import { MessageService } from '../message/message.service';
import { SystemMessageType } from '../message/message.model';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

export class ReportsStat {
  @ApiProperty({ example: 1, description: 'Total reports' })
  readonly totalReports: number;

  @ApiProperty({ example: 1, description: 'Monthly reports' })
  readonly monthlyReports: number;

  @ApiProperty({ example: 1, description: 'Total unresolved reports' })
  readonly totalUnresolved: number;

  @ApiProperty({ example: 1, description: 'Monthly unresolved reports' })
  readonly monthlyUnresolved: number;

  @ApiProperty({ example: 1, description: 'Total resolved reports' })
  readonly totalResolved: number;

  @ApiProperty({ example: 1, description: 'Monthly resolved reports' })
  readonly monthlyResolved: number;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report) private reportRepository: typeof Report,
    @InjectModel(User) private userRepository: typeof User,
    private chatService: ChatService,
    private messageService: MessageService,
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
    const reportedUser: User = await this.userRepository.findOne({
      include: [Role],
      where: { id: sendDto.reportedId },
    });
    if (
      !reportedUser ||
      reportedUser.roles.map((role) => role.value).includes('admin')
    ) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'reportedId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if report doesn't already exist
    // const reportExist = await this.reportRepository.count({
    //   where: { ownerId: user.id, reportedId: sendDto.reportedId },
    // });
    // if (reportExist) {
    //   throw new HttpException(
    //     new Error(ErrorType.BadFields, { info: 'Report already exist' }),
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

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

    if ([true, false, 'true', 'false'].includes(filterDto.showUnresolved)) {
      reportsWhere['resolved'] = ![true, 'true'].includes(
        filterDto.showUnresolved,
      );
    }

    const reports: Report[] = await this.reportRepository.findAll({
      where: reportsWhere,
      offset: filterDto.offset,
      limit: 20,
      order: [
        ['answer', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });

    for (const report of reports) {
      report.dataValues.owner = (
        await this.sequelize.query(
          `
        SELECT *,
        ${userAdditionalInfoQuery}
        FROM "user"
        WHERE id = ${report.ownerId}
      `,
          { mapToModel: true, model: User },
        )
      )[0];

      report.dataValues.reported = (
        await this.sequelize.query(
          `
        SELECT *,
        ${userAdditionalInfoQuery}
        FROM "user"
        WHERE id = ${report.reportedId}
      `,
          { mapToModel: true, model: User },
        )
      )[0];
    }

    return reports;
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

    await report.update({ answer: answerDto.answer });

    // Get or create support chat with user and admin
    console.log(`CHECK CHAT WITH ${user.id} ${report.ownerId}`);
    let chat: Chat = await this.chatService.getChatWithTwoUsers(
      user.id,
      report.ownerId,
    );
    console.log(`CHECK CHAT WITH ${chat}`);
    if (!chat) {
      chat = await this.chatService.createChatWithTwoUsers(
        ChatType.support,
        user.id,
        report.ownerId,
      );
    }
    console.log(`CHECK CHAT WITH ${chat}`);

    // Send report answer to chat
    const uuid: string = uuidv4();
    const response = await this.messageService.sendMessage(
      user,
      { toChatId: chat.id, uuid, text: 'Ваша жалоба была обработана' },
      SystemMessageType.Default,
      report.id,
    );
    console.log(response);

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
      AND created_at >= '${filterDto.startDate}'
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
