import { InjectModel } from '@nestjs/sequelize';
import { GetChatDto } from './dto/get-chat.dto';
import { ChatUser } from './chat-user.model';
import { User } from '../user/user.model';

export class ChatService {
  constructor(
    @InjectModel(ChatUser) private chatUserRepository: typeof ChatUser,
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
}
