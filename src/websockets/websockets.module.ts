import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), RedisModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class WebsocketsModule {}
