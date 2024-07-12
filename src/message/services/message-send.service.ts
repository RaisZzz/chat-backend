import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../message.model';
import { ChatService } from '../../chat/chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { User } from '../../user/user.model';
import { Chat } from '../../chat/chat.model';
import { Error, ErrorType } from '../../error.class';
import { SocketGateway } from '../../websockets/socket.gateway';
import { ChatUser } from '../../chat/chat-user.model';
import { MessageSetUnreceivedService } from './message-set-unreceived.service';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MessageSendService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private chatService: ChatService,
    private socketGateway: SocketGateway,
    private messageSetUnreceivedService: MessageSetUnreceivedService,
    private sequelize: Sequelize,
  ) {}

  async sendMessage(
    user: User,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    // Check only to chat or to user
    if (
      (!sendMessageDto.toChatId && !sendMessageDto.toUserId) ||
      (sendMessageDto.toChatId && sendMessageDto.toUserId)
    ) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    let chat: Chat | undefined;

    // If to chat then check if user exist in this chat
    if (sendMessageDto.toChatId) {
      chat = await this.chatService.checkUserExistInChat(user, {
        chatId: sendMessageDto.toChatId,
      });
      if (!chat) {
        throw new HttpException(
          new Error(ErrorType.BadFields),
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      // If to user then check if user exist else create new chat
      chat = await this.chatService.getChatWithUser(user, {
        userId: sendMessageDto.toUserId,
      });
    }

    // Save message
    const messageDto = {
      uuid: sendMessageDto.uuid,
      chatId: chat.id,
      ownerId: user.id,
      text: sendMessageDto.text,
      createdAt: Date.now(),
    };

    const message = new this.messageModel(messageDto);
    await message.save();
    const messageJson = message.toJSON();
    this.sendMessageToAllUsersInChat(messageJson);
    return message;
  }

  private async sendMessageToAllUsersInChat(message: Message): Promise<void> {
    const chatUsers: ChatUser[] = await this.chatService.getAllChatUsers(
      message.chatId,
    );
    for (let i = 0; i < chatUsers.length; i++) {
      const userId = chatUsers[i].userId;
      await this.messageSetUnreceivedService.setMessageUnreceived(
        message.chatId,
        message.uuid,
        userId,
      );

      // Get chat info
      const [chatInfoRes] = await this.sequelize.query(`
        SELECT *,
        (SELECT login FROM "user" where id = (
          CASE 
            WHEN users[1] = ${chatUsers[i].userId} THEN users[2]
            ELSE users[1]
          END
        )) as "title"
        FROM
        (SELECT *,
          (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
          FROM "chat"
          WHERE id = ${message.chatId}
        ) asd
        LIMIT 1;
      `);
      message['chat'] = chatInfoRes[0] as Chat;
      this.socketGateway.sendMessage(userId, [message]);
    }
  }
}
