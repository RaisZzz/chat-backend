import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Message, SystemMessageType } from './message.model';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/user.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetUnreceivedService } from './services/message-set-unreceived.service';
import { SendUnreceivedMessagesService } from './services/send-unreceived-messages.service';
import { SuccessInterface } from '../base/success.interface';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageReceived } from './message-received.model';
import { GetMessagesDto } from './dto/get-messages.dto';
import { Chat } from '../chat/chat.model';
import { SetMessageLikeDto } from './dto/set-like.dto';
import { Error, ErrorType } from '../error.class';
import { InjectModel } from '@nestjs/sequelize';
import { ChatUser } from '../chat/chat-user.model';
import { Voice } from '../voice/voice.model';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { SocketGateway } from '../websockets/socket.gateway';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(Voice) private voiceRepository: typeof Voice,
    @InjectModel(ChatUser) private chatUserRepository: typeof ChatUser,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectMongooseModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    private messageSendService: MessageSendService,
    private messageSetReceivedService: MessageSetUnreceivedService,
    private sendUnreceivedMessagesService: SendUnreceivedMessagesService,
    private socketGateway: SocketGateway,
  ) {}

  sendMessage = async (
    user: User,
    sendMessageDto: SendMessageDto,
    systemId: SystemMessageType = SystemMessageType.Default,
    reportId: number | null = null,
    photos: [Express.Multer.File] | null = null,
    voice: [Express.Multer.File] | null = null,
  ): Promise<Message> =>
    this.messageSendService.sendMessage(
      user,
      sendMessageDto,
      systemId,
      reportId,
      photos,
      voice,
    );

  sendUnreceivedMessages = async (userId: number): Promise<SuccessInterface> =>
    this.sendUnreceivedMessagesService.sendAll(userId);

  async getAll(user: User, getDto: GetMessagesDto): Promise<Message[]> {
    const userExistInChat: ChatUser = await this.chatUserRepository.findOne({
      where: { chatId: getDto.chatId, userId: user.id },
    });
    if (!userExistInChat) {
      throw new HttpException('No', HttpStatus.FORBIDDEN);
    }

    const messages: Message[] = await this.messageModel.find(
      {
        chatId: getDto.chatId,
      },
      null,
      { sort: { createdAt: -1 }, limit: 20, skip: getDto.offset },
    );
    const newMessages = messages.map((m) => {
      return { ...m }['_doc'];
    });

    for (const m of newMessages) {
      if (m.voiceId) {
        m['voice'] = (
          await this.voiceRepository.findOne({
            where: { id: m.voiceId },
          })
        ).toJSON();
      }
    }

    return newMessages;
  }

  async setMessageLike(
    user: User,
    setLikeDto: SetMessageLikeDto,
  ): Promise<SuccessInterface> {
    const message: Message = await this.messageModel.findOne({
      uuid: setLikeDto.messageUuid,
    });
    if (message.ownerId !== user.id) {
      const chat: Chat = await this.chatRepository.findOne({
        where: { id: message.chatId },
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
    }

    await this.messageModel.updateOne(
      { uuid: message.uuid },
      { liked: setLikeDto.like },
    );
    message.liked = setLikeDto.like;

    this.messageSendService.sendMessageToAllUsersInChat({ ...message }['_doc']);

    return { success: true };
  }

  async setMessageReceived(
    user: User,
    setMessageReceivedDto: SetMessageReceivedDto,
  ): Promise<SuccessInterface> {
    const messagesReceivedExist: MessageReceived[] =
      await this.messageReceivedModel.find({
        messageUuid: { $in: setMessageReceivedDto.messagesUuid },
        userId: user.id,
      });

    const messageReceivedExistUuids: string[] = messagesReceivedExist.map(
      (m: MessageReceived) => m.messageUuid,
    );
    const messageReceivedNotExistUuids: string[] =
      setMessageReceivedDto.messagesUuid.filter(
        (uuid: string) => !messageReceivedExistUuids.includes(uuid),
      );

    await this.messageReceivedModel.updateMany(
      {
        messageUuid: { $in: messageReceivedExistUuids },
        userId: user.id,
      },
      { received: true },
    );

    if (messageReceivedNotExistUuids.length) {
      await this.messageReceivedModel.insertMany(
        messageReceivedNotExistUuids.map((uuid) => {
          return {
            messageUuid: uuid,
            userId: user.id,
            received: true,
          };
        }),
      );
    }

    return { success: true };
  }

  async readChatMessages(
    user: User,
    readDto: ReadMessagesDto,
  ): Promise<SuccessInterface> {
    const usersInChat: ChatUser[] = await this.chatUserRepository.findAll({
      where: { chatId: readDto.chatId },
    });

    if (!usersInChat.map((c) => c.userId).includes(user.id)) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    await this.messageModel.updateMany(
      {
        chatId: readDto.chatId,
        ownerId: { $ne: user.id },
      },
      {
        isRead: true,
      },
    );

    for (const chatUser of usersInChat) {
      if (chatUser.userId !== user.id) {
        this.socketGateway.sendUserReadChat(
          chatUser.userId,
          user.id,
          readDto.chatId,
        );
      }
    }

    return { success: true };
  }

  async deleteAllMessageReceivedData(chatId: number): Promise<void> {
    await this.messageReceivedModel.deleteMany({ chatId });
  }
}
