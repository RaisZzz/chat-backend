import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../message/message.model';

@WebSocketGateway({
  pingTimeout: 1000,
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private userRepository: typeof User,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
    console.log('SOCKET TRY CONNECT');
    const firebaseToken = client.handshake.query.firebaseToken;

    // Get user by token
    let jwtUser;

    try {
      jwtUser = this.jwtService.verify(String(client.handshake.query.token));
    } catch (e) {}

    if (jwtUser?.id) {
      const userExist = await this.userRepository.count({
        where: { id: jwtUser.id },
      });

      if (userExist) {
        console.log(
          `
            User #${jwtUser.id} connected with:
            token: ${client.handshake.query.token},
            socket: ${client.id},
            firebase token: ${firebaseToken}
          `,
        );
      }
    }
  }

  sendMessage(userId: number, message: Message) {
    console.log('SEND MESSAGE TO ', userId);
  }

  afterInit(server: Server) {
    console.log('WEBSOCKETS INIT');
  }
}
