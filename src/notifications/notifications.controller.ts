import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { SmsGuard } from '../user/sms.guard';
import { OffsetDto } from '../base/offset.dto';
import { Notification } from './notifications.model';
import { SuccessInterface } from '../base/success.interface';

@ApiTags('Уведомления')
@Controller('notification')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Получить все уведомления' })
  @ApiResponse({ status: 200, type: [Notification] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard)
  @Get('/get_all')
  create(@Req() req, @Query() offsetDto: OffsetDto): Promise<Notification[]> {
    return this.notificationsService.getAll(req.user, offsetDto);
  }

  @ApiOperation({ summary: 'Пометить уведомление прочитанным' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard)
  @Post('/read')
  read(
    @Req() req,
    @Body() readDto: ReadNotificationDto,
  ): Promise<SuccessInterface> {
    return this.notificationsService.readNotification(req.user, readDto);
  }
}
