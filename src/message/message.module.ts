import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageModel } from './message.model';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: messageModel,
      },
    ]),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
