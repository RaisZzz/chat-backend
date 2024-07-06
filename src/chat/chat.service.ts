import { InjectModel } from '@nestjs/sequelize';
import { GetChatDto } from './dto/get-chat.dto';
import { ChatUser } from './chat-user.model';
import { User } from '../user/user.model';
import { GetChatWithUserDto } from './dto/get-chat-with-user.dto';
import { Chat, ChatType } from './chat.model';
import { Sequelize } from 'sequelize-typescript';
import { UserService } from '../user/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Error, ErrorType } from '../error.class';

export class ChatService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(ChatUser) private chatUserRepository: typeof ChatUser,
    private userService: UserService,
  ) {}

  async checkUserExistInChat(
    user: User,
    getChatDto: GetChatDto,
  ): Promise<boolean> {
    const chatUser: ChatUser = await this.chatUserRepository.findOne({
      where: {
        chatId: getChatDto.chatId,
        userId: user.id,
      },
    });
    return !!chatUser;
  }

  async getChatWithUser(
    user: User,
    getChatWithUserDto: GetChatWithUserDto,
  ): Promise<Chat> {
    // TODO: Favorites messages
    if (getChatWithUserDto.userId === user.id) {
      throw new HttpException(
        'Favorites not unimplemented',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Check user exist
    const userExist: boolean = await this.userService.checkUserExist(
      getChatWithUserDto.userId,
    );
    if (!userExist) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check user has chat with another user
    const [chatResponse] = await this.sequelize.query(`
      SELECT * FROM "chat"
      WHERE type = ${ChatType.user}
      AND EXISTS (
        SELECT id FROM "chat_user"   
        WHERE user_id = ${user.id}
        AND chat_id = "chat".id
      )
      AND EXISTS (
        SELECT id FROM "chat_user"   
        WHERE user_id = ${getChatWithUserDto.userId}
        AND chat_id = "chat".id
      )
      LIMIT 1
    `);
    const chats: Chat[] = chatResponse as Chat[];
    if (chats.length) {
      return chats[0];
    }

    // Create new chat with user
    const newChat: Chat = await this.chatRepository.create({
      type: ChatType.user,
    });
    await this.chatUserRepository.create({
      userId: user.id,
      chatId: newChat.id,
    });
    await this.chatUserRepository.create({
      userId: getChatWithUserDto.userId,
      chatId: newChat.id,
    });

    return newChat;
  }
}
