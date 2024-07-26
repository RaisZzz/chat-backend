import { Injectable } from '@nestjs/common';
import { Message } from '../message.model';
import { SuccessInterface } from '../../base/success.interface';
import { MessageReceived } from '../message-received.model';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketGateway } from '../../websockets/socket.gateway';
import { Chat } from '../../chat/chat.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SendUnreceivedMessagesService {
  constructor(
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectMongooseModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    private socketGateway: SocketGateway,
    private sequelize: Sequelize,
  ) {}

  async sendAll(userId: number): Promise<SuccessInterface> {
    const unreceivedMessages: MessageReceived[] =
      await this.messageReceivedModel.find({
        userId: userId,
        received: false,
      });
    if (!unreceivedMessages.length) return;

    const messages: Message[] = await this.messageModel.find({
      uuid: { $in: unreceivedMessages.map((m) => m.messageUuid) },
    });

    // Get chats info
    const [chatsResponse] = await this.sequelize.query(`
      SELECT *,
      (SELECT first_name FROM "user" where id = (
        CASE 
          WHEN users[1] = ${userId} THEN users[2]
          ELSE users[1]
        END
      )) as "title"
      FROM
      (SELECT *,
        (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
        FROM "chat"
        WHERE id IN (${[...new Set(messages.map((m) => m.chatId))]})
      ) asd
    `);
    const chats: Chat[] = chatsResponse as Chat[];

    const messagesWithChat = messages.map((m) => {
      return { ...m }['_doc'];
    });

    messagesWithChat.forEach((m) => {
      m['chat'] = chats.find((c) => c.id === m.chatId);
    });

    // Send messages
    for (let i = 0; i < Math.ceil(messagesWithChat.length / 20); i++) {
      this.socketGateway.sendMessage(
        userId,
        [...messagesWithChat].splice(i * 20, 20),
      );
    }

    return { success: true };
  }
}
