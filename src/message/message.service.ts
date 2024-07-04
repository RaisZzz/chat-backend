import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/user.model';
import { Error, ErrorType } from '../error.class';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private chatService: ChatService,
    private userService: UserService,
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
    } else {
      // If to user then check if user exist
      const userExist: boolean = await this.userService.checkUserExist(
        sendMessageDto.toUserId,
      );
      if (!userExist) {
        throw new HttpException(
          new Error(ErrorType.BadFields),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Save message
    const chatId: string = sendMessageDto.toChatId
      ? `chat_${sendMessageDto.toChatId}`
      : `user_${sendMessageDto.toUserId}`;

    const uuid: string = uuidv4();

    const messageDto = {
      uuid,
      chatId,
      ownerId: user.id,
      text: sendMessageDto.text,
    };

    const message = new this.messageModel(messageDto);
    return await message.save();
  }
}
