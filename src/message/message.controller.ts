import { Body, Controller, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from '../schemas/message.schema';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('send')
  sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<Message> {
    return this.messageService.sendMessage(sendMessageDto);
  }
}
