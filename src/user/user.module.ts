import { forwardRef, Module } from '@nestjs/common';
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

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserReaction, Report, Image, UserDevice]),
    forwardRef(() => AuthModule),
    WebsocketsModule,
    RedisModule,
    ImageModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
