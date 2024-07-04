import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from '../schemas/message.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
}
