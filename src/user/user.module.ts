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

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserReaction, Report]),
    forwardRef(() => AuthModule),
    WebsocketsModule,
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
