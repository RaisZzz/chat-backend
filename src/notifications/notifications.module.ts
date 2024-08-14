import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { NotificationsController } from './notifications.controller';
import { Chat } from '../chat/chat.model';
import { Notification } from './notifications.model';
import { FirebaseModule } from '../firebase/firebase.module';
import { RedisModule } from '../redis/redis.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { AuthModule } from '../auth/auth.module';
import { UserReaction } from '../user-reaction/user-reaction.model';

@Module({
  providers: [NotificationsService],
  imports: [
    SequelizeModule.forFeature([User, UserReaction, Chat, Notification]),
    FirebaseModule,
    WebsocketsModule,
    RedisModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
