import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatUser } from './chat-user.model';
import { ChatService } from './chat.service';
import { Chat } from './chat.model';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageModel } from '../message/message.model';
import { WebsocketsModule } from '../websockets/websockets.module';
import { ChatReceived } from './chat-received.model';
import {
  MessageReceived,
  messageReceivedModel,
} from '../message/message-received.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: messageModel,
      },
      {
        name: MessageReceived.name,
        schema: messageReceivedModel,
      },
    ]),
    SequelizeModule.forFeature([Chat, ChatUser, ChatReceived]),
    UserModule,
    AuthModule,
    WebsocketsModule,
  ],
  providers: [ChatService],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}