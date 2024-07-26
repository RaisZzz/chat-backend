import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageModel } from './message.model';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import {
  MessageReceived,
  messageReceivedModel,
} from './message-received.model';
import { MessageSendService } from './services/message-send.service';
import { MessageSetUnreceivedService } from './services/message-set-unreceived.service';
import { SendUnreceivedMessagesService } from './services/send-unreceived-messages.service';
import { WebsocketsModule } from '../websockets/websockets.module';
import { Chat } from '../chat/chat.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { ImageModule } from '../image/image.module';
import { VoiceModule } from '../voice/voice.module';
import { ChatUser } from '../chat/chat-user.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Chat, ChatUser]),
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
    UserModule,
    AuthModule,
    WebsocketsModule,
    ImageModule,
    VoiceModule,
    NotificationsModule,
  ],
  providers: [
    MessageService,
    MessageSendService,
    MessageSetUnreceivedService,
    SendUnreceivedMessagesService,
  ],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
