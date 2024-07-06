import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './message.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessageSendService } from './services/message-send.service';

@Controller('message')
export class MessageController {
  constructor(private messageSendService: MessageSendService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Req() req,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return this.messageSendService.sendMessage(req.user, sendMessageDto);
  }
}
