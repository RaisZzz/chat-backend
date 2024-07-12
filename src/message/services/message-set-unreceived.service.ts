import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageReceived } from '../message-received.model';

@Injectable()
export class MessageSetUnreceivedService {
  constructor(
    @InjectModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
  ) {}

  async setMessageUnreceived(
    chatId: number,
    messageUuid: string,
    userId: number,
  ): Promise<void> {
    const messageReceivedExist: MessageReceived =
      await this.messageReceivedModel.findOne({
        messageUuid,
        userId,
      });
    if (messageReceivedExist) {
      if (messageReceivedExist.received) {
        await this.messageReceivedModel.updateOne(
          {
            messageUuid,
            userId,
          },
          { received: false },
        );
        return;
      }
      return;
    }

    const messageReceived = new this.messageReceivedModel({
      chatId,
      messageUuid,
      userId,
      received: false,
    });
    await messageReceived.save();
  }
}
