import { Injectable } from '@nestjs/common';
import { Message } from '../message.model';
import { SuccessInterface } from '../../base/success.interface';
import { MessageReceived } from '../message-received.model';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketGateway } from '../../websockets/socket.gateway';
import { Chat, chatInfoPsqlQuery } from '../../chat/chat.model';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Voice } from '../../voice/voice.model';
import { ChatLink } from '../../chat/chat-link.model';

@Injectable()
export class SendUnreceivedMessagesService {
  constructor(
    @InjectModel(Voice) private voiceRepository: typeof Voice,
    @InjectModel(ChatLink) private chatLinkRepository: typeof ChatLink,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectMongooseModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    private socketGateway: SocketGateway,
    private sequelize: Sequelize,
  ) {}

  async sendAll(userId: number, deviceId: string): Promise<SuccessInterface> {
    const unreceivedMessages: MessageReceived[] =
      await this.messageReceivedModel.find({
        userId: userId,
        deviceId,
        received: false,
      });
    if (!unreceivedMessages.length) return;

    const messages: Message[] = await this.messageModel.find({
      uuid: { $in: unreceivedMessages.map((m) => m.messageUuid) },
    });

    // Get chats info
    const [chatsResponse] = await this.sequelize.query(`
      SELECT *,
      ${chatInfoPsqlQuery(userId)}
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

    for (const m of messagesWithChat) {
      m['unreceived'] = true;
      m['chat'] = chats.find((c) => c.id === m.chatId);
      m['chat']['unread'] = await this.messageModel.countDocuments({
        chatId: m['chat']['id'],
        ownerId: { $ne: userId },
        isRead: false,
      });
      if (m.voiceId) {
        m['voice'] = await this.voiceRepository.findOne({
          where: { id: m.voiceId },
        });
      }
      if (m.linkId) {
        m['link'] = await this.chatLinkRepository.findOne({
          where: { id: m.linkId },
        });
      }
    }

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
