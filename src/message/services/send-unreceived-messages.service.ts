import { Injectable } from '@nestjs/common';
import { Message } from '../message.model';
import { SuccessInterface } from '../../base/success.interface';
import { MessageReceived } from '../message-received.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SendUnreceivedMessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
  ) {}

  async sendAll(userId: number): Promise<SuccessInterface> {
    const unreceivedMessages: MessageReceived[] =
      await this.messageReceivedModel.find({
        userId: userId,
        received: false,
      });
    if (!unreceivedMessages.length) return;

    const messages: Message[] = await this.messageModel.find({
      uuid: { $in: unreceivedMessages.map((i) => i.messageUuid) },
    });

    return { success: true };
  }
}
