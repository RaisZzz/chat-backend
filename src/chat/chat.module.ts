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
import { User } from '../user/user.model';
import { MessageModule } from '../message/message.module';
import { Voice } from '../voice/voice.model';

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
    SequelizeModule.forFeature([User, Chat, ChatUser, ChatReceived, Voice]),
    UserModule,
    AuthModule,
    WebsocketsModule,
    MessageModule,
  ],
  providers: [ChatService],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
