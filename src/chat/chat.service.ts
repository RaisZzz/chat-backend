import { InjectModel } from '@nestjs/sequelize';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { GetChatDto } from './dto/get-chat.dto';
import { ChatUser } from './chat-user.model';
import { User } from '../user/user.model';
import { Chat, chatInfoPsqlQuery, ChatType } from './chat.model';
import { Sequelize } from 'sequelize-typescript';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { Error, ErrorType } from '../error.class';
import { Role } from '../role/role.model';
import { UserDevice } from '../user/user-device.model';
import { BaseDto } from '../base/base.dto';
import { ShareChatDto } from './dto/share-chat.dto';
import { ChatLink } from './chat-link.model';
import { CreateChatLinkDto } from './dto/create-chat-link.dto';
import { SendMessageDto } from '../message/dto/send-message.dto';
import { ConfirmShareChatDto } from './dto/confirm-share-chat.dto';
import { GetSharedChatDto } from './dto/get-shared-chat.dto';
import { GetSharedChatMessagesDto } from './dto/get-shared-chat-messages.dto';

@Injectable()
export class ChatService {
  constructor(
    private sequelize: Sequelize,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectMongooseModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserDevice) private userDeviceRepository: typeof UserDevice,
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(ChatLink) private chatLinkRepository: typeof ChatLink,
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
    type: ChatType,
    firstUserId: number,
    secondUserId: number,
  ): Promise<Chat> {
    // Check user has chat with another user
    const [chatResponse] = await this.sequelize.query(`
      SELECT * FROM "chat"
      WHERE type = ${type}
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
      chat = await this.chatRepository.create({ type });
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

      if (type === ChatType.user) {
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
      if (message) {
        const messageJson = { ...message }['_doc'];

        if (message.voiceId) {
          messageJson['voice'] = (
            await this.voiceRepository.findOne({
              where: { id: messageJson.voiceId },
            })
          ).toJSON();
        }
        if (message.linkId) {
          messageJson['link'] = (
            await this.chatLinkRepository.findOne({
              where: { id: messageJson.linkId },
            })
          ).toJSON();
        }

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
      const chatReceived: ChatReceived[] = await this.setChatUnreceived(
        chatUsers[i].chatId,
        chatUsers[i].userId,
        ChatReceivedType.deleted,
      );
      chatReceives.push(...chatReceived);
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

  async sendAllUnreceivedChats(
    user: User,
    baseDto: BaseDto,
  ): Promise<SuccessInterface> {
    const chatReceived: ChatReceived[] =
      await this.chatReceivedRepository.findAll({
        where: {
          deviceId: baseDto.deviceId,
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
          deviceId: setDto.deviceId,
          userId: user.id,
          chatId: setDto.chatId,
        },
      },
    );
    return { success: true };
  }

  async getUserSupportChat(user: User): Promise<Chat> {
    // Check user has support chat
    const [chatResponse] = await this.sequelize.query(`
      SELECT * FROM "chat"
      WHERE type = ${ChatType.support}
      AND EXISTS (
        SELECT id FROM "chat_user"   
        WHERE user_id = ${user.id}
        AND chat_id = "chat".id
      )
      LIMIT 1
    `);
    const chats: Chat[] = chatResponse as Chat[];

    let chat: Chat;
    if (chats.length) {
      chat = chats[0];
    } else {
      const availableAdminUser: User = await this.userRepository.findOne({
        attributes: ['id'],
        include: [
          {
            model: Role,
            where: { value: 'admin' },
          },
        ],
      });
      if (!availableAdminUser) {
        throw new HttpException(
          new Error(ErrorType.AdminNotAvailable),
          HttpStatus.BAD_REQUEST,
        );
      }
      chat = await this.createChatWithTwoUsers(
        ChatType.support,
        user.id,
        availableAdminUser.id,
      );
    }

    return chat;
  }

  async shareChat(
    user: User,
    shareChatDto: ShareChatDto,
  ): Promise<SuccessInterface> {
    // Check if user has access to chat
    const chat: Chat = await this.checkUserExistInChat(user, {
      chatId: shareChatDto.chatId,
      ...shareChatDto,
    });

    if (!chat) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const lastChatLink: ChatLink = await this.chatLinkRepository.findOne({
      where: { chatId: chat.id, userId: user.id },
      order: [['createdAt', 'DESC']],
    });
    if (lastChatLink) {
      const today: Date = new Date();
      const lastLinkCreatedAt: Date = new Date(lastChatLink.createdAt);
      const hourInSeconds = 3600;
      const seconds: number =
        (today.getTime() - lastLinkCreatedAt.getTime()) / 1000;
      if (seconds < hourInSeconds) {
        throw new HttpException(
          new Error(ErrorType.Forbidden, {
            timeLeft: Math.ceil(hourInSeconds - seconds),
          }),
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const uuid: string = uuidv4();

    const createLinkDto: CreateChatLinkDto = {
      uuid,
      chatId: chat.id,
      expireTime: shareChatDto.expireTime,
      userId: user.id,
    };

    const link: ChatLink = await this.chatLinkRepository.create(createLinkDto);

    const dto: SendMessageDto = {
      toChatId: chat.id,
      text: '',
      uuid: uuidv4(),
    };

    await this.messageService.sendMessage(
      user,
      dto,
      SystemMessageType.ShareConfirm,
      null,
      null,
      null,
      link.id,
    );

    return { success: true };
  }

  async confirmShareChat(
    user: User,
    confirmDto: ConfirmShareChatDto,
  ): Promise<SuccessInterface> {
    const link: ChatLink = await this.chatLinkRepository.findOne({
      where: { id: confirmDto.linkId, confirmed: false, canceled: false },
    });
    if (!link) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const chat: Chat = await this.chatRepository.findOne({
      where: { id: link.chatId },
    });
    if (!chat) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const chatUsers: ChatUser[] = await this.getAllChatUsers(chat.id);

    const anotherUserId: number =
      chatUsers[0].userId === link.userId
        ? chatUsers[1].userId
        : chatUsers[0].userId;

    if (anotherUserId !== user.id) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    if (confirmDto.confirmed) {
      await link.update({ confirmed: true });
    } else {
      await link.update({ canceled: true });
    }

    const message: Message = await this.messageModel.findOne({
      linkId: link.id,
    });

    if (message) {
      this.messageService.sendMessageToAllUsersInChat(
        { ...message }['_doc'],
        true,
      );
    }

    return { success: true };
  }

  async getSharedChat(getSharedChatDto: GetSharedChatDto): Promise<Chat> {
    // Check chat link exist
    const chatLink: ChatLink = await this.chatLinkRepository.findOne({
      where: {
        uuid: getSharedChatDto.chatLinkUuid,
        confirmed: true,
        canceled: false,
      },
    });
    if (!chatLink) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    // Check chat link not expired
    const today: Date = new Date();
    const linkExpiredAt: Date = new Date(chatLink.createdAt);
    linkExpiredAt.setMinutes(linkExpiredAt.getMinutes() + chatLink.expireTime);
    if (linkExpiredAt.getTime() < today.getTime()) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    // Get chat
    const [chatInfoRes] = await this.sequelize.query(
      `
        SELECT *,
        ${chatInfoPsqlQuery(chatLink.userId)}
        FROM
        (SELECT *,
          (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
          FROM "chat"
          WHERE id = ${chatLink.chatId}
        ) asd
        LIMIT 1;
      `,
    );
    if (!chatInfoRes.length) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const chat: Chat = chatInfoRes[0] as Chat;
    chat.dataValues['ownerId'] = chatLink.userId;

    return chat;
  }

  async getSharedChatMessages(
    getSharedChatMessagesDto: GetSharedChatMessagesDto,
  ): Promise<Message[]> {
    const chat: Chat = await this.getSharedChat(getSharedChatMessagesDto);

    return await this.messageService.getAll(
      new User(),
      { chatId: chat.id, offset: getSharedChatMessagesDto.offset },
      false,
    );
  }

  private async setChatUnreceived(
    chatId: number,
    userId: number,
    type: ChatReceivedType,
  ): Promise<ChatReceived[]> {
    const userDevices: UserDevice[] = await this.userDeviceRepository.findAll({
      attributes: ['deviceId'],
      where: { userId },
    });

    const chatReceived: ChatReceived[] =
      await this.chatReceivedRepository.findAll({
        where: {
          chatId,
          userId,
          deviceId: { [Op.in]: userDevices.map((u) => u.deviceId) },
        },
      });

    await this.chatReceivedRepository.update(
      {
        type,
        received: false,
      },
      {
        where: {
          chatId,
          userId,
          deviceId: { [Op.in]: userDevices.map((u) => u.deviceId) },
        },
      },
    );

    const uncreatedChatReceivedUserDevice: UserDevice[] = [
      ...userDevices,
    ].filter((u) => !chatReceived.map((c) => c.deviceId).includes(u.deviceId));
    if (!uncreatedChatReceivedUserDevice.length) return chatReceived;

    const newChatReceived: ChatReceived[] =
      await this.chatReceivedRepository.bulkCreate(
        uncreatedChatReceivedUserDevice.map((u: UserDevice) => {
          return {
            userId,
            deviceId: u.deviceId,
            chatId,
            type,
            received: false,
          };
        }),
      );

    return [...chatReceived, ...newChatReceived];
  }
}
