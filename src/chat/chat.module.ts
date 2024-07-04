import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatUser } from './chat-user.model';
import { ChatService } from './chat.service';
import { Chat } from './chat.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([Chat, ChatUser]), UserModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
