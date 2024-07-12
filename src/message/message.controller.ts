import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './message.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { MessageService } from './message.service';
import { SuccessInterface } from '../base/success.interface';
import { GetMessagesDto } from './dto/get-messages.dto';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard)
  getAll(@Req() req, @Query() getDto: GetMessagesDto): Promise<Message[]> {
    return this.messageService.getAll(req.user, getDto);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Req() req,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return this.messageService.sendMessage(req.user, sendMessageDto);
  }

  @Post('set-received')
  @UseGuards(JwtAuthGuard)
  setMessageReceived(
    @Req() req,
    @Body() setMessageReceivedDto: SetMessageReceivedDto,
  ): Promise<SuccessInterface> {
    return this.messageService.setMessageReceived(
      req.user,
      setMessageReceivedDto,
    );
  }

  @Post('send-unreceived')
  @UseGuards(JwtAuthGuard)
  sendUnreceivedMessages(@Req() req): Promise<SuccessInterface> {
    return this.messageService.sendUnreceivedMessages(req.user.id);
  }
}
