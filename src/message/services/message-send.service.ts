import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../message.model';
import { ChatService } from '../../chat/chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { User } from '../../user/user.model';
import { Chat } from '../../chat/chat.model';
import { Error, ErrorType } from '../../error.class';
import { SocketGateway } from '../../websockets/socket.gateway';

@Injectable()
export class MessageSendService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private chatService: ChatService,
    private socketGateway: SocketGateway,
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

    let chatId: number | undefined;

    // If to chat then check if user exist in this chat
    if (sendMessageDto.toChatId) {
      const userExistInChat: boolean =
        await this.chatService.checkUserExistInChat(user, {
          chatId: sendMessageDto.toChatId,
        });
      if (!userExistInChat) {
        throw new HttpException(
          new Error(ErrorType.BadFields),
          HttpStatus.BAD_REQUEST,
        );
      }
      chatId = sendMessageDto.toChatId;
    } else {
      // If to user then check if user exist else create new chat
      const chatExist: Chat = await this.chatService.getChatWithUser(user, {
        userId: sendMessageDto.toUserId,
      });
      chatId = chatExist.id;
    }

    // Save message
    const uuid: string = uuidv4();

    const messageDto = {
      uuid,
      chatId,
      ownerId: user.id,
      text: sendMessageDto.text,
    };

    const message = new this.messageModel(messageDto);
    await message.save();
    console.log(1);
    this.socketGateway.sendMessage(1, message);
    console.log(2);
    return message;
  }
}
