import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Message } from './message.model';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/user.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetUnreceivedService } from './services/message-set-unreceived.service';
import { SendUnreceivedMessagesService } from './services/send-unreceived-messages.service';
import { SuccessInterface } from '../base/success.interface';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageReceived } from './message-received.model';
import { GetMessagesDto } from './dto/get-messages.dto';
import { ChatService } from 'src/chat/chat.service';
import { Chat } from '../chat/chat.model';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
    private messageSendService: MessageSendService,
    private messageSetReceivedService: MessageSetUnreceivedService,
    private sendUnreceivedMessagesService: SendUnreceivedMessagesService,
    private chatService: ChatService,
  ) {}

  sendMessage = async (
    user: User,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> =>
    this.messageSendService.sendMessage(user, sendMessageDto);

  sendUnreceivedMessages = async (userId: number): Promise<SuccessInterface> =>
    this.sendUnreceivedMessagesService.sendAll(userId);

  async getAll(user: User, getDto: GetMessagesDto): Promise<Message[]> {
    const userExistInChat: Chat = await this.chatService.checkUserExistInChat(
      user,
      {
        chatId: getDto.chatId,
      },
    );
    if (!userExistInChat) {
      throw new HttpException('No', HttpStatus.FORBIDDEN);
    }

    return this.messageModel.find(
      {
        chatId: getDto.chatId,
      },
      null,
      { sort: { createdAt: -1 }, limit: 20, skip: getDto.offset },
    );
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
}
