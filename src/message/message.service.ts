import { Injectable } from '@nestjs/common';
import { Message } from './message.model';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/user.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetReceivedService } from './services/message-set-received.service';

@Injectable()
export class MessageService {
  constructor(
    private messageSendService: MessageSendService,
    private messageSetReceivedService: MessageSetReceivedService,
  ) {}

  sendMessage = async (
    user: User,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> =>
    this.messageSendService.sendMessage(user, sendMessageDto);

  setMessageReceived = async (
    messageUuid: string,
    userId: number,
  ): Promise<void> =>
    this.messageSetReceivedService.setMessageReceived(messageUuid, userId);
}
