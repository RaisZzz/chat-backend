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
import { MessageSetReceivedService } from './services/message-set-received.service';
import { BullModule } from '@nestjs/bull';

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
    BullModule.registerQueue({
      name: 'messageQueue',
    }),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  providers: [MessageService, MessageSendService, MessageSetReceivedService],
  controllers: [MessageController],
})
export class MessageModule {}
