import { InjectModel } from '@nestjs/sequelize';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { GetChatDto } from './dto/get-chat.dto';
import { ChatUser } from './chat-user.model';
import { User } from '../user/user.model';
import { Chat, chatInfoPsqlQuery, ChatType } from './chat.model';
import { Sequelize } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { OffsetDto } from '../base/offset.dto';
import { Message, SystemMessageType } from '../message/message.model';
import { Model } from 'mongoose';
import { SuccessInterface } from '../base/success.interface';
import { ChatReceived, ChatReceivedType } from './chat-received.model';
import { SocketGateway } from '../websockets/socket.gateway';
import { Op } from 'sequelize';
import { MessageReceived } from '../message/message-received.model';
import { MessageService } from '../message/message.service';
import { v4 as uuidv4 } from 'uuid';
import { Voice } from '../voice/voice.model';

@Injectable()
export class ChatService {
  constructor(
    private sequelize: Sequelize,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectMongooseModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(Voice) private voiceRepository: typeof Voice,
    @InjectModel(ChatUser) private chatUserRepository: typeof ChatUser,
    @InjectModel(ChatReceived)
    private chatReceivedRepository: typeof ChatReceived,
    private socketGateway: SocketGateway,
    private messageService: MessageService,
  ) {}

  async checkUserExistInChat(
    user: User,
    getChatDto: GetChatDto,
  ): Promise<Chat> {
    const chat: Chat = await this.chatRepository.findOne({
      where: { id: getChatDto.chatId },
    });
    const chatUser: ChatUser = await this.chatUserRepository.findOne({
      where: {
        chatId: getChatDto.chatId,
        userId: user.id,
      },
    });
    if (chat && chatUser) {
      return chat;
    }
    return null;
  }

  async createChatWithTwoUsers(
    firstUserId: number,
    secondUserId: number,
  ): Promise<Chat> {
    // Check user has chat with another user
    const [chatResponse] = await this.sequelize.query(`
      SELECT * FROM "chat"
      WHERE type = ${ChatType.user}
      AND EXISTS (
        SELECT id FROM "chat_user"   
        WHERE user_id = ${firstUserId}
        AND chat_id = "chat".id
      )
      AND EXISTS (
        SELECT id FROM "chat_user"   
        WHERE user_id = ${secondUserId}
        AND chat_id = "chat".id
      )
      LIMIT 1
    `);
    const chats: Chat[] = chatResponse as Chat[];

    let chat: Chat;

    if (chats.length) {
      chat = chats[0];
    } else {
      // Create new chat with user
      chat = await this.chatRepository.create({
        type: ChatType.user,
      });
      await this.chatUserRepository.create({
        userId: firstUserId,
        chatId: chat.id,
      });
      await this.chatUserRepository.create({
        userId: secondUserId,
        chatId: chat.id,
      });

      const fakeUser = new User();
      fakeUser.id = firstUserId;
      fakeUser.dataValues.id = firstUserId;

      await this.messageService.sendMessage(
        fakeUser,
        {
          uuid: uuidv4(),
          text: '',
          toChatId: chat.id,
        },
        SystemMessageType.ChatCreated,
      );
    }

    return chat;
  }

  async getAllChatUsers(chatId: number): Promise<ChatUser[]> {
    return await this.chatUserRepository.findAll({
      where: { chatId },
    });
  }

  async getAllChatsForUser(user: User, offsetDto: OffsetDto): Promise<Chat[]> {
    const [chatsResponse] = await this.sequelize.query(`
      SELECT *,
      ${chatInfoPsqlQuery(user.id)}
      FROM
      (SELECT *,
        (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
        FROM "chat"
      ) asd
      WHERE users @> ARRAY[${user.id}]
      OFFSET ${offsetDto.offset}
      LIMIT 20
    `);
    const chats: Chat[] = chatsResponse as Chat[];

    for (let i = 0; i < chats.length; i++) {
      const chat: Chat = chats[i];

      const message = await this.messageModel.findOne(
        {
          chatId: chat.id,
        },
        null,
        { sort: { createdAt: -1 } },
      );
      if (message && message.voiceId) {
        const messageJson = { ...message }['_doc'];
        messageJson['voice'] = (
          await this.voiceRepository.findOne({
            where: { id: messageJson.voiceId },
          })
        ).toJSON();
        chat['lastMessage'] = messageJson;
      }
    }

    return chats;
  }

  async deleteChat(chatId: number): Promise<SuccessInterface> {
    const chatExist: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });
    if (!chatExist) return;

    this.messageService.deleteAllMessageReceivedData(chatExist.id);

    const chatUsers: ChatUser[] = await this.chatUserRepository.findAll({
      attributes: ['chatId', 'userId'],
      where: {
        chatId: chatExist.id,
      },
    });

    await this.chatUserRepository.destroy({
      where: {
        chatId: chatExist.id,
        userId: { [Op.in]: chatUsers.map((c: ChatUser) => c.userId) },
      },
    });
    await chatExist.destroy();
    await this.messageReceivedModel.updateMany(
      {
        chatId: chatExist.id,
      },
      { received: true },
    );
    const chatReceives: ChatReceived[] = [];
    for (let i = 0; i < chatUsers.length; i++) {
      const chatReceived: ChatReceived = await this.setChatUnreceived(
        chatUsers[i].chatId,
        chatUsers[i].userId,
        ChatReceivedType.deleted,
      );
      chatReceives.push(chatReceived);
    }

    chatReceives.forEach((c: ChatReceived) => {
      this.socketGateway.sendChat(c.userId, [{ id: c.chatId, deleted: true }]);
    });

    return { success: true };
  }

  async getChatWithTwoUsers(
    firstUserId: number,
    secondUserId: number,
  ): Promise<Chat> {
    const [chatsResponse] = await this.sequelize.query(`
      SELECT * FROM
      (SELECT *,
        (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
        FROM "chat"
      ) asd
      WHERE users = ARRAY[${firstUserId}, ${secondUserId}]
      OR users = ARRAY[${secondUserId}, ${firstUserId}]
    `);
    const chats: Chat[] = chatsResponse as Chat[];
    if (chats.length) {
      return chats[0];
    } else {
      return null;
    }
  }

  async sendAllUnreceivedChats(user: User): Promise<SuccessInterface> {
    const chatReceived: ChatReceived[] =
      await this.chatReceivedRepository.findAll({
        where: {
          userId: user.id,
          received: false,
        },
      });

    const chatReceivedDeleted: ChatReceived[] = [...chatReceived].filter(
      (c) => c.type === ChatReceivedType.deleted,
    );

    for (let i = 0; i < Math.ceil(chatReceivedDeleted.length / 20); i++) {
      this.socketGateway.sendChat(
        user.id,
        [...chatReceivedDeleted].splice(i * 20, 20).map((c) => {
          return {
            id: c.chatId,
            deleted: true,
          };
        }),
      );
    }

    return { success: true };
  }

  async setChatReceived(
    user: User,
    setDto: GetChatDto,
  ): Promise<SuccessInterface> {
    await this.chatReceivedRepository.update(
      { received: true },
      {
        where: {
          userId: user.id,
          chatId: setDto.chatId,
        },
      },
    );
    return { success: true };
  }

  private async setChatUnreceived(
    chatId: number,
    userId: number,
    type: ChatReceivedType,
  ): Promise<ChatReceived> {
    let chatReceived: ChatReceived = await this.chatReceivedRepository.findOne({
      where: { chatId, userId },
    });
    if (chatReceived) {
      await chatReceived.update({ type, received: false });
    } else {
      chatReceived = await this.chatReceivedRepository.create({
        userId,
        chatId,
        type,
        received: false,
      });
    }

    return chatReceived;
  }
}
