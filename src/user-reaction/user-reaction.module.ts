import { Module } from '@nestjs/common';
import { UserReactionController } from './user-reaction.controller';
import { UserReactionService } from './user-reaction.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { UserReaction } from './user-reaction.model';
import { ChatModule } from '../chat/chat.module';
import { UserReactionReceived } from './user-reaction-received.model';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserDevice } from '../user/user-device.model';
import { Notification } from '../notifications/notifications.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserReaction,
      UserReactionReceived,
      UserDevice,
      Notification,
    ]),
    ChatModule,
    WebsocketsModule,
    NotificationsModule,
  ],
  controllers: [UserReactionController],
  providers: [UserReactionService],
  exports: [UserReactionService],
})
export class UserReactionModule {}
