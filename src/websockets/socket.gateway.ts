import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../message/message.model';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Report } from '../report/report.model';
import { Notification } from '../notifications/notifications.model';
import { Sequelize } from 'sequelize-typescript';

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
    private redisService: RedisService,
    @InjectModel(User) private userRepository: typeof User,
    private sequelize: Sequelize,
  ) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: Record<string, string[]> = {};

  getUserConnected = (userId: number): boolean =>
    !!this.connectedUsers[userId]?.length;

  getConnectedUsers = (): Record<string, string[]> => this.connectedUsers;

  private getUserIdBySocket(client: Socket): string {
    const userConnectedIndex: number = Object.values(
      this.connectedUsers,
    ).findIndex((s) => s.includes(client.id));
    if (userConnectedIndex < 0)
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    return Object.keys(this.connectedUsers)[userConnectedIndex];
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    try {
      const userId: string = this.getUserIdBySocket(client);
      const socketExistIndex = !this.connectedUsers[userId]
        ? -1
        : this.connectedUsers[userId].findIndex((s) => s === client.id);
      if (socketExistIndex >= 0) {
        this.connectedUsers[userId].splice(socketExistIndex, 1);
      }
      this.redisService.hSet(String(userId), 'online', String(Date.now()));

      if (!this.connectedUsers[userId] || !this.connectedUsers[userId].length) {
        this.sendUserOnline(parseInt(userId), Date.now());
      }
    } catch (e) {}
  }

  async handleConnection(client: Socket): Promise<void> {
    console.log('SOCKET TRY CONNECT', client.handshake.query.token);

    // Get user by token
    let jwtUser;

    try {
      const accessOptions = {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
        secret: process.env.JWT_ACCESS_SECRET,
      };
      jwtUser = await this.jwtService.verifyAsync(
        String(client.handshake.query.token),
        accessOptions,
      );
    } catch (e) {
      client.disconnect();
    }

    if (jwtUser?.id) {
      const userExist = await this.userRepository.count({
        where: { id: jwtUser.id },
      });

      if (userExist) {
        if (!this.connectedUsers[String(jwtUser.id)]) {
          this.connectedUsers[String(jwtUser.id)] = [];
        }
        if (!this.connectedUsers[String(jwtUser.id)].includes(client.id)) {
          this.connectedUsers[String(jwtUser.id)].push(client.id);
        }

        const newOnline = String(Date.now());
        this.redisService.hSet(String(jwtUser.id), 'online', newOnline);
        this.sendUserOnline(jwtUser.id, true);
        console.log(
          `
            User #${jwtUser.id} connected with:
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
    this.log(
      `TRY SEND SOCKET '${eventName}' ${userId} ${JSON.stringify(this.connectedUsers)}`,
    );
    const sockets = this.connectedUsers[String(userId)];
    if (!sockets || !sockets.length) return;

    for (const socket of sockets) {
      this.log(`SEND '${eventName}' TO USER #${userId} (socket: ${socket})`);
      this.server.to(socket).emit(eventName, data);
    }
  }

  sendMessage = (userId: number, messages: Message[]): void =>
    this.sendSocket('message', userId, messages);

  sendChat = (userId: number, chats: Record<any, any>[]): void =>
    this.sendSocket('chat', userId, chats);

  sendUserReaction = (
    userId: number,
    userReactions: Record<any, any>[],
  ): void => this.sendSocket('userReaction', userId, userReactions);

  sendUpdateData = (userId: number) =>
    this.sendSocket('updateData', userId, null);

  sendReport = (userId: number, report: Report) =>
    this.sendSocket('report', userId, report.toJSON());

  sendNotification = (notification: Notification) =>
    this.sendSocket('notification', notification.to, notification.toJSON());

  sendWriting = (userId: number, writingUserId: number) =>
    this.sendSocket('writing', userId, writingUserId);

  sendVoiceRecording = (userId: number, recordingUserId: number) =>
    this.sendSocket('voiceRecording', userId, recordingUserId);

  sendUserReadChat = (userId: number, readedUserId: number, chatId: number) =>
    this.sendSocket('userReadChat', userId, { chatId, readedUserId });

  sendVerificationUserRequest = (userId: number, user: User) =>
    this.sendSocket('verificationUserRequest', userId, user.toJSON());

  @SubscribeMessage('writing')
  async onWriting(client: Socket, data) {
    if (!data || !data.chatId) return;

    const connectedUserIndex: number = Object.values(
      this.connectedUsers,
    ).findIndex((s) => s.includes(client.id));

    if (connectedUserIndex < 0) return;

    const userId: string = Object.keys(this.connectedUsers)[connectedUserIndex];

    const [userIds] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE chat_id = ${data.chatId}
      AND user_id <> ${userId}
    `);
    for (const toUser of userIds) {
      this.sendWriting(toUser['user_id'], parseInt(userId));
    }
  }

  @SubscribeMessage('voiceRecording')
  async onVoiceRecording(client: Socket, data) {
    if (!data || !data.chatId) return;

    const connectedUserIndex: number = Object.values(
      this.connectedUsers,
    ).findIndex((s) => s.includes(client.id));

    if (connectedUserIndex < 0) return;

    const userId: string = Object.keys(this.connectedUsers)[connectedUserIndex];

    const [userIds] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE chat_id = ${data.chatId}
      AND user_id <> ${userId}
    `);
    for (const toUser of userIds) {
      this.sendVoiceRecording(toUser['user_id'], parseInt(userId));
    }
  }

  private async sendUserOnline(userId: number, online: any) {
    const [userIds] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE chat_id IN (
        SELECT chat_id FROM "chat_user"
        WHERE user_id = ${userId}
      )
      AND user_id <> ${userId}
    `);
    for (const toUser of userIds) {
      this.sendSocket('userOnline', parseInt(String(toUser['user_id'])) || 0, {
        userId,
        online,
      });
    }
  }

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
