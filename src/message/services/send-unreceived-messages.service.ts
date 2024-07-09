import { Injectable } from '@nestjs/common';
import { Message } from '../message.model';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SuccessInterface } from '../../base/success.interface';
import { MessageReceived } from '../message-received.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SendUnreceivedMessagesService {
  constructor(
    @InjectQueue('messageQueue') private readonly messageQueue: Queue,
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
      uuid: { $in: unreceivedMessages.map((i) => i.uuid) },
    });

    for (let i = 0; i < Math.ceil(messages.length / 20); i++) {
      setTimeout(() => {
        const sentMessages = [...messages].splice(i * 20, 20);
        sentMessages.forEach((message) =>
          this.messageQueue.add('sendMessage', message),
        );
      }, 1000 * i);
    }

    return { success: true };
  }
}
