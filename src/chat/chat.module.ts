import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatUser } from './chat-user.model';
import { ChatService } from './chat.service';

@Module({
  imports: [SequelizeModule.forFeature([ChatUser])],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
