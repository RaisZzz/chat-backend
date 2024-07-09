import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class WebsocketsModule {}
