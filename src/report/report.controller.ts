import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportService, ReportsStat } from './report.service';
import { SendReportDto } from './dto/send-report.dto';
import { Report } from './report.model';
import { AnswerReportDto } from './dto/answer-report.dto';
import { StatisticFilterDto } from '../statistic/dto/statistic-filter.dto';
import { SetResolvedDto } from './dto/set-resolved.dto';
import { GetReportsDto } from './dto/get.dto';
import { UserBlockGuard } from '../user/user-block.guard';
import { Roles } from '../role/roles-auth.decorator';
import { RolesGuard } from '../role/roles.guard';
import { SmsGuard } from '../user/sms.guard';
import { UserDeletedGuard } from '../user/user-deleted.guard';

@ApiTags('Жалобы')
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @ApiOperation({ summary: 'Отправить жалобу' })
  @ApiResponse({ status: 200, type: Report })
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  @Post('/send')
  send(@Req() req, @Body() reportDto: SendReportDto): Promise<Report> {
    return this.reportService.send(req.user, reportDto);
  }

  @ApiOperation({ summary: 'Получить все жалобы (для админа)' })
  @ApiResponse({ status: 200, type: [Report] })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/get_all')
  getAll(@Query() filterDto: GetReportsDto): Promise<Report[]> {
    return this.reportService.getAll(filterDto);
  }

  @ApiOperation({ summary: 'Статистика по жалобам (для админа)' })
  @ApiResponse({ status: 200, type: [Report] })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/get_stat')
  getStat(@Query() filterDto: StatisticFilterDto): Promise<ReportsStat> {
    return this.reportService.getStatistic(filterDto);
  }

  @ApiOperation({ summary: 'Ответить на жалобу (для админа)' })
  @ApiResponse({ status: 200, type: Report })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/answer')
  answer(@Req() req, @Body() answerDto: AnswerReportDto): Promise<Report> {
    return this.reportService.answerReport(req.user, answerDto);
  }

  @ApiOperation({ summary: 'Изменить статус (для админа)' })
  @ApiResponse({ status: 200, type: Report })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/set_resolved')
  setResolved(@Body() resolvedDto: SetResolvedDto): Promise<Report> {
    return this.reportService.setResolved(resolvedDto);
  }
}
