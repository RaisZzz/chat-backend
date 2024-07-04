import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chat-test'),
    MessageModule,
  ],
})
export class AppModule {}
