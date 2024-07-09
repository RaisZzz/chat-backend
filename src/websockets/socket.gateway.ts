import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../message/message.model';
import { HttpException, HttpStatus } from '@nestjs/common';

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

  private connectedUsers: Record<string, string> = {};

  private getUserIdBySocket(client: Socket): string {
    const userConnectedIndex: number = Object.values(
      this.connectedUsers,
    ).findIndex((s) => s === client.id);
    if (userConnectedIndex < 0)
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    return Object.keys(this.connectedUsers)[userConnectedIndex];
  }

  async handleDisconnect(client: Socket): Promise<void> {
    console.log(`Client disconnected: ${client.id}`);
    const userId: string = this.getUserIdBySocket(client);
    delete this.connectedUsers[userId];
  }

  async handleConnection(client: Socket): Promise<void> {
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
        this.connectedUsers[String(jwtUser.id)] = client.id;
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

  private sendSocket(eventName: string, userId: number, data: any): void {
    const socket = this.connectedUsers[String(userId)];
    if (!socket) return;

    console.log(`SEND SOCKET ${eventName} TO USER #${userId}`);
    this.server.to(socket).emit(eventName, data);
  }

  sendMessage = (userId: number, message: Message): void =>
    this.sendSocket('message', userId, message);

  afterInit(server: Server): void {
    console.log('WEBSOCKETS INIT');
  }
}
