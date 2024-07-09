import { Injectable } from '@nestjs/common';
import { Message } from './message.model';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/user.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetUnreceivedService } from './services/message-set-unreceived.service';
import { SendUnreceivedMessagesService } from './services/send-unreceived-messages.service';
import { SuccessInterface } from '../base/success.interface';

@Injectable()
export class MessageService {
  constructor(
    private messageSendService: MessageSendService,
    private messageSetReceivedService: MessageSetUnreceivedService,
    private sendUnreceivedMessagesService: SendUnreceivedMessagesService,
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

  sendUnreceivedMessages = async (userId: number): Promise<SuccessInterface> =>
    this.sendUnreceivedMessagesService.sendAll(userId);
}
