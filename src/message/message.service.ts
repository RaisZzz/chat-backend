import { Injectable } from '@nestjs/common';
import { Message } from './message.model';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/user.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetUnreceivedService } from './services/message-set-unreceived.service';
import { SendUnreceivedMessagesService } from './services/send-unreceived-messages.service';
import { SuccessInterface } from '../base/success.interface';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageReceived } from './message-received.model';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    private messageSendService: MessageSendService,
    private messageSetReceivedService: MessageSetUnreceivedService,
    private sendUnreceivedMessagesService: SendUnreceivedMessagesService,
  ) {}

  sendMessage = async (
    user: User,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> =>
    this.messageSendService.sendMessage(user, sendMessageDto);

  setMessageUnreceived = async (
    messageUuid: string,
    userId: number,
  ): Promise<void> =>
    this.messageSetReceivedService.setMessageUnreceived(messageUuid, userId);

  sendUnreceivedMessages = async (userId: number): Promise<SuccessInterface> =>
    this.sendUnreceivedMessagesService.sendAll(userId);

  async setMessageReceived(
    user: User,
    setMessageReceivedDto: SetMessageReceivedDto,
  ): Promise<SuccessInterface> {
    const messageReceivedExist: MessageReceived =
      await this.messageReceivedModel.findOne({
        messageUuid: setMessageReceivedDto.messageUuid,
        userId: user.id,
      });

    if (!messageReceivedExist) {
      await this.messageReceivedModel.create({
        messageUuid: setMessageReceivedDto.messageUuid,
        userId: user.id,
        received: true,
      });
    } else {
      await this.messageReceivedModel.updateOne({
        messageUuid: setMessageReceivedDto.messageUuid,
        received: true,
      });
    }

    return { success: true };
  }
}
