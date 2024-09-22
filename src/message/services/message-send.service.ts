import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, SystemMessageType } from '../message.model';
import { SendMessageDto } from '../dto/send-message.dto';
import { User } from '../../user/user.model';
import { Chat, chatInfoPsqlQuery } from '../../chat/chat.model';
import { Error, ErrorType } from '../../error.class';
import { SocketGateway } from '../../websockets/socket.gateway';
import { ChatUser } from '../../chat/chat-user.model';
import { MessageSetUnreceivedService } from './message-set-unreceived.service';
import { Sequelize } from 'sequelize-typescript';
import { Image } from '../../image/image.model';
import { ImageService } from '../../image/image.service';
import { Voice } from '../../voice/voice.model';
import { VoiceService } from '../../voice/voice.service';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/notification-type.enum';
import { ChatLink } from '../../chat/chat-link.model';

@Injectable()
export class MessageSendService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(ChatLink) private chatLinkRepository: typeof ChatLink,
    @InjectModel(Voice) private voiceRepository: typeof Voice,
    @InjectModel(ChatUser) private chatUserRepository: typeof ChatUser,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    private socketGateway: SocketGateway,
    private imageService: ImageService,
    private notificationService: NotificationsService,
    private voiceService: VoiceService,
    private messageSetUnreceivedService: MessageSetUnreceivedService,
    private sequelize: Sequelize,
  ) {}

  async sendMessage(
    user: User,
    sendMessageDto: SendMessageDto,
    systemId: SystemMessageType = SystemMessageType.Default,
    reportId: number | null = null,
    photos: [Express.Multer.File] | null = null,
    voice: [Express.Multer.File] | null = null,
    linkId: number | null = null,
  ): Promise<Message> {
    if (sendMessageDto.text) {
      sendMessageDto.text = sendMessageDto.text
        .trim()
        .replace(/\n+/g, '\n')
        .replace(/ +/g, ' ');
    }

    if (
      !sendMessageDto.text?.length &&
      !(Array.isArray(photos) && photos.length) &&
      !(Array.isArray(voice) && voice.length) &&
      !systemId &&
      !reportId
    ) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { fields: 'text, photos, voice' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    const chat: Chat = await this.chatRepository.findOne({
      where: { id: sendMessageDto.toChatId },
    });
    if (!chat) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }
    const chatUser: ChatUser = await this.chatUserRepository.findOne({
      where: { chatId: chat.id, userId: user.id },
    });
    if (!chatUser) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const imagesIds: number[] = await this.saveMessageImages(
      user.id,
      photos,
      sendMessageDto.uuid,
    );

    const voiceId: number | null = await this.saveMessageVoice(
      voice,
      user.id,
      sendMessageDto.uuid,
    );

    // Save message
    const messageDto = {
      uuid: sendMessageDto.uuid,
      chatId: chat.id,
      ownerId: user.id,
      text: sendMessageDto.text,
      systemId,
      reportId,
      imagesIds,
      voiceId,
      createdAt: Date.now(),
      linkId,
    };

    const message = new this.messageModel(messageDto);
    await message.save();
    const messageJson = message.toJSON();
    this.sendMessageToAllUsersInChat({ ...messageJson });
    return message;
  }

  async sendMessageToAllUsersInChat(
    message: Message,
    withoutNotification: boolean = false,
  ): Promise<void> {
    const user: User = await this.userRepository.findOne({
      attributes: ['firstName', 'lastName', 'sex'],
      where: { id: message.ownerId },
    });

    const chatUsers: ChatUser[] = await this.chatUserRepository.findAll({
      where: { chatId: message.chatId },
    });
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
        ${chatInfoPsqlQuery(chatUsers[i].userId)}
        FROM
        (SELECT *,
          (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
          FROM "chat"
          WHERE id = ${message.chatId}
        ) asd
        LIMIT 1;
      `);
      const chat: Chat = chatInfoRes[0] as Chat;
      message['chat'] = chat;
      message['chat']['unread'] = await this.messageModel.countDocuments({
        chatId: message['chat']['id'],
        ownerId: { $ne: userId },
        isRead: false,
      });
      if (message.voiceId) {
        message['voice'] = (
          await this.voiceRepository.findOne({
            where: { id: message.voiceId },
          })
        ).toJSON();
      }
      if (message.linkId) {
        message['link'] = (
          await this.chatLinkRepository.findOne({
            where: { id: message.linkId },
          })
        ).toJSON();
      }

      this.socketGateway.sendMessage(userId, [message]);

      if (userId !== message.ownerId && !withoutNotification) {
        this.notificationService.sendNotification(
          {
            from: message.ownerId,
            to: userId,
            type: NotificationType.message,
            title: `${user.firstName} ${user.lastName}`,
            body: `Отправил${user.sex === 0 ? 'а' : ''} вам сообщение`,
          },
          true,
          chat,
        );
      }
    }
  }

  private async saveMessageImages(
    userId: number,
    photos: [Express.Multer.File] | null,
    messageUuid: string,
  ): Promise<number[]> {
    const imagesIds: number[] = [];

    if (!Array.isArray(photos)) return [];

    if (!photos.length) return [];

    if (photos.length > 10) {
      throw new HttpException(
        new Error(ErrorType.FilesCount),
        HttpStatus.BAD_REQUEST,
      );
    }

    const imageTypes: string[] = ['image/jpeg', 'image/png'];
    photos.forEach((photo) => {
      if (!imageTypes.includes(photo.mimetype)) {
        throw new HttpException(
          new Error(ErrorType.FileType),
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    for (const photo of photos) {
      const file: Image = await this.imageService.saveFile(
        photo,
        `message_${messageUuid}_${userId}`,
      );
      imagesIds.push(file.id);
    }

    return imagesIds;
  }

  private async saveMessageVoice(
    voices: [Express.Multer.File] | null,
    userId: number,
    messageUuid: string,
  ): Promise<number | null> {
    if (!Array.isArray(voices)) return;
    if (!voices.length) return;

    const voiceTypes: string[] = ['audio/mp4'];
    if (!voiceTypes.includes(voices[0].mimetype)) {
      throw new HttpException(
        new Error(ErrorType.FileType),
        HttpStatus.BAD_REQUEST,
      );
    }

    const voiceModel: Voice = await this.voiceService.saveFile(
      voices[0],
      `voice_${messageUuid}_${userId}`,
    );

    return voiceModel.id;
  }
}
