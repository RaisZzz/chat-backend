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
    messageUuid: string,
    userId: number,
  ): Promise<void> {
    const messageReceivedExist: MessageReceived =
      await this.messageReceivedModel.findOne({
        messageUuid,
        userId,
      });
    if (messageReceivedExist) return;

    const messageReceived = new this.messageReceivedModel({
      messageUuid,
      userId,
    });
    await messageReceived.save();
  }
}
