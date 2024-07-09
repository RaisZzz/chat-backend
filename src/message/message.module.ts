import { Module } from '@nestjs/common';
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
    UserModule,
    AuthModule,
    ChatModule,
    WebsocketsModule,
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
