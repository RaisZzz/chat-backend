import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { AuthModule } from '../auth/auth.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { RedisModule } from '../redis/redis.module';
import { UserReaction } from '../user-reaction/user-reaction.model';
import { Report } from '../report/report.model';
import { ImageModule } from '../image/image.module';
import { Image } from '../image/image.model';
import { UserDevice } from './user-device.model';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserReaction, Report, Image, UserDevice]),
    AuthModule,
    WebsocketsModule,
    RedisModule,
    ImageModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
