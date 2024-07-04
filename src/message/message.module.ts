import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageSchema } from '../schemas/message.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: messageSchema,
      },
    ]),
  ],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}