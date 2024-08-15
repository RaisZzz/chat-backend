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

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserReaction, UserReactionReceived]),
    ChatModule,
    WebsocketsModule,
    NotificationsModule,
  ],
  controllers: [UserReactionController],
  providers: [UserReactionService],
  exports: [UserReactionService],
})
export class UserReactionModule {}
