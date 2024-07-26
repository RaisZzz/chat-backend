import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from 'src/chat/chat.model';
import { User } from 'src/user/user.model';
import { Image } from 'src/image/image.model';
import { RedisModule } from '../redis/redis.module';
import { UserReaction } from '../user-reaction/user-reaction.model';

@Module({
  providers: [FirebaseService],
  imports: [
    SequelizeModule.forFeature([Chat, User, UserReaction, Image]),
    RedisModule,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
