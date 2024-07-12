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
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

@WebSocketGateway({
  pingTimeout: 1000,
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(SocketGateway.name);

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
    try {
      const userId: string = this.getUserIdBySocket(client);
      delete this.connectedUsers[userId];
    } catch (e) {}
  }

  async handleConnection(client: Socket): Promise<void> {
    console.log('SOCKET TRY CONNECT', client.handshake.query.token);

    // Get user by token
    let jwtUser;

    try {
      const accessOptions = {
        expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRE) || 0,
        secret: process.env.JWT_ACCESS_SECRET,
      };
      jwtUser = await this.jwtService.verifyAsync(
        String(client.handshake.query.token),
        accessOptions,
      );
    } catch (e) {
      client.disconnect();
    }

    if (jwtUser?.sub) {
      const userExist = await this.userRepository.count({
        where: { id: jwtUser.sub },
      });

      if (userExist) {
        this.connectedUsers[String(jwtUser.sub)] = client.id;
        console.log(
          `
            User #${jwtUser.sub} connected with:
            token: ${client.handshake.query.token},
            socket: ${client.id}
          `,
        );
      } else {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  private sendSocket(eventName: string, userId: number, data: any): void {
    const socket = this.connectedUsers[String(userId)];
    if (!socket) return;

    this.log(`SEND '${eventName}' TO USER #${userId}`);
    this.server.to(socket).emit(eventName, data);
  }

  sendMessage = (userId: number, messages: Message[]): void =>
    this.sendSocket('message', userId, messages);

  sendChat = (userId: number, chats: Record<any, any>[]): void =>
    this.sendSocket('chat', userId, chats);

  afterInit = (server: Server): void => this.log('INIT');

  private log(message?: any, ...optionalParams: any[]): void {
    console.log(
      this.socketConsoleColor,
      '[WEBSOCKETS] -',
      this.resetConsoleColor,
      new Date().toISOString(),
      this.socketConsoleColor,
      message,
      ...optionalParams,
      this.resetConsoleColor,
    );
  }

  private socketConsoleColor = '\x1b[36m';
  private resetConsoleColor = '\x1b[0m';
}
