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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/send-notification.dto';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { SmsGuard } from '../user/sms.guard';
import { OffsetDto } from '../base/offset.dto';

@ApiTags('Уведомления')
@Controller('notification')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Получить все уведомления' })
  @ApiResponse({ status: 200, type: [CreateNotificationDto] })
  @UseGuards(JwtAuthGuard, SmsGuard)
  @Get('/get_all')
  create(@Req() req, @Query() offsetDto: OffsetDto) {
    return this.notificationsService.getAll(req.user, offsetDto);
  }

  @ApiOperation({ summary: 'Пометить уведомление прочитанным' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard, SmsGuard)
  @Post('/read')
  read(@Req() req, @Body() readDto: ReadNotificationDto) {
    return this.notificationsService.readNotification(req.user, readDto);
  }
}
