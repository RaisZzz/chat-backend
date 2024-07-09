import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './message.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { MessageService } from './message.service';
import { SuccessInterface } from '../base/success.interface';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

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
}
