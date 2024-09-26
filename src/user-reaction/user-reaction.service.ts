import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserReaction } from './user-reaction.model';
import { excludedUserAttributes, User } from '../user/user.model';
import { SendUserReactionDto } from './dto/send-user-reaction.dto';
import { Error, ErrorType } from '../error.class';
import { ChatService } from '../chat/chat.service';
import { Chat, ChatType } from '../chat/chat.model';
import {
  UserReactionReceived,
  UserReactionReceivedType,
} from './user-reaction-received.model';
import { SuccessInterface } from '../base/success.interface';
import { SetUserReactionReceivedDto } from './dto/set-received.dto';
import { SocketGateway } from '../websockets/socket.gateway';
import { Op } from 'sequelize';
import { OffsetDto } from '../base/offset.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type.enum';
import { UserDevice } from '../user/user-device.model';
import { BaseDto } from '../base/base.dto';
import { Notification } from '../notifications/notifications.model';

export class SendReactionResponse {
  readonly userReaction: UserReaction;
  readonly chat?: Chat;
}

@Injectable()
export class UserReactionService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserDevice) private userDeviceRepository: typeof UserDevice,
    @InjectModel(Notification)
    private notificationRepository: typeof Notification,
    @InjectModel(UserReactionReceived)
    private userReactionReceivedRepository: typeof UserReactionReceived,
    @InjectModel(UserReaction)
    private userReactionRepository: typeof UserReaction,
    private chatService: ChatService,
    private socketGateway: SocketGateway,
    private notificationsService: NotificationsService,
  ) {}

  async getAllUserReactions(
    user: User,
    offsetDto: OffsetDto,
  ): Promise<UserReaction[]> {
    // Get only incoming likes reactions
    const userReactions: UserReaction[] =
      await this.userReactionRepository.findAll({
        where: {
          recipientId: user.id,
          isLiked: true,
        },
        offset: parseInt(offsetDto.offset.toString()) || 0,
        limit: 20,
      });

    for (let i = 0; i < userReactions.length; i++) {
      const userReaction: UserReaction = userReactions[i];
      const anotherUserId: number =
        userReaction.recipientId === user.id
          ? userReaction.senderId
          : userReaction.recipientId;

      const anotherUser: User = await this.userRepository.findOne({
        attributes: { exclude: excludedUserAttributes },
        where: { id: anotherUserId },
      });
      userReaction['user'] = anotherUser;
      userReaction.dataValues['user'] = anotherUser;
    }

    return userReactions;
  }

  async send(
    user: User,
    sendDto: SendUserReactionDto,
  ): Promise<SendReactionResponse> {
    if (typeof sendDto.superLikeMsg === 'string') {
      sendDto.superLikeMsg = sendDto.superLikeMsg
        .trim()
        .replace(/\n+/g, '\n')
        .replace(/ +/g, ' ');
    }

    // Check user not equal
    if (user.id === sendDto.toUserId) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'toUserId' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check user has super likes on balance
    if (sendDto.superLikeMsg && user.superLikes <= 0) {
      throw new HttpException(
        new Error(ErrorType.SuperLikesCount),
        HttpStatus.FORBIDDEN,
      );
    }

    // Check liked user exist
    const recipientExist: User = await this.userRepository.findOne({
      attributes: { exclude: excludedUserAttributes },
      where: { id: sendDto.toUserId },
    });
    if (!recipientExist) {
      throw new HttpException(
        new Error(ErrorType.UserNotFound),
        HttpStatus.NOT_FOUND,
      );
    }

    // If not super like, then check another user like exist
    const recipientReaction: UserReaction =
      await this.userReactionRepository.findOne({
        where: { senderId: sendDto.toUserId, recipientId: user.id },
      });

    if (
      sendDto.isLiked &&
      !sendDto.superLikeMsg &&
      (!recipientReaction || !recipientReaction.isLiked)
    ) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create or update reaction
    let reaction: UserReaction = await this.userReactionRepository.findOne({
      where: { senderId: user.id, recipientId: sendDto.toUserId },
    });

    if (reaction) {
      reaction.changed('updatedAt', true);
      await reaction.update({
        isLiked: sendDto.isLiked,
        superLikeMsg: sendDto.superLikeMsg,
        updatedAt: Date.now(),
      });
    } else {
      reaction = await this.userReactionRepository.create({
        senderId: user.id,
        recipientId: sendDto.toUserId,
        isLiked: sendDto.isLiked,
        superLikeMsg: sendDto.superLikeMsg,
      });
    }

    let createdChat: Chat | null;

    if (!sendDto.isLiked) {
      // Delete chat if dislike
      const chat: Chat = await this.chatService.getChatWithTwoUsers(
        user.id,
        sendDto.toUserId,
      );

      if (chat) await this.chatService.deleteChat(chat.id);

      // Delete reaction another user
      if (recipientReaction) {
        await recipientReaction.destroy();
        this.setUserReactionUnreceived(
          recipientReaction.senderId,
          recipientReaction.id,
          UserReactionReceivedType.deleted,
        );
      }

      // Delete all notifications
      this.notificationRepository.destroy({
        where: {
          [Op.or]: [
            { from: user.id, to: recipientExist.id },
            { from: recipientExist.id, to: user.id },
          ],
        },
      });
    } else {
      if (recipientReaction && recipientReaction.isLiked) {
        // Create chat if above users likes
        createdChat = await this.chatService.createChatWithTwoUsers(
          ChatType.user,
          user.id,
          sendDto.toUserId,
        );
        this.notificationsService.sendNotification(
          {
            from: user.id,
            to: sendDto.toUserId,
            type: NotificationType.mutual,
            title: `${user.firstName} ${user.lastName}`,
            body: `Образовал${user.sex === 0 ? 'а' : ''} с вами пару`,
          },
          false,
          createdChat,
        );
        this.notificationsService.sendNotification(
          {
            from: sendDto.toUserId,
            to: user.id,
            type: NotificationType.mutual,
            title: `${recipientExist.firstName} ${recipientExist.lastName}`,
            body: `Образовал${recipientExist.sex === 0 ? 'а' : ''} с вами пару`,
          },
          false,
          createdChat,
        );
      } else {
        // Remove 1 super like from user balance
        await user.update({ superLikes: user.superLikes - 1 });
        this.notificationsService.sendNotification(
          {
            from: user.id,
            to: sendDto.toUserId,
            type: NotificationType.superlike,
            title: `${user.firstName} ${user.lastName}`,
            body: `Отправил${user.sex === 0 ? 'а' : ''} вам симпатию`,
          },
          false,
          null,
          user,
        );
      }
    }

    const userReactionReceivedType = sendDto.isLiked
      ? UserReactionReceivedType.sent
      : UserReactionReceivedType.deleted;

    this.setUserReactionUnreceived(
      user.id,
      reaction.id,
      userReactionReceivedType,
    );
    this.setUserReactionUnreceived(
      sendDto.toUserId,
      reaction.id,
      userReactionReceivedType,
    );

    reaction.dataValues['user'] = user.toJSON();
    this.socketGateway.sendUserReaction(sendDto.toUserId, [reaction]);

    reaction.dataValues['user'] = recipientExist.toJSON();
    this.socketGateway.sendUserReaction(user.id, [reaction]);

    return { userReaction: reaction, chat: createdChat };
  }

  async sendAllUnreceivedReactions(
    user: User,
    baseDto: BaseDto,
  ): Promise<SuccessInterface> {
    const userReactionReceived: UserReactionReceived[] =
      await this.userReactionReceivedRepository.findAll({
        where: {
          userId: user.id,
          deviceId: baseDto.deviceId,
          received: false,
        },
      });

    for (const userReaction of userReactionReceived) {
      userReaction['unreceived'] = true;
      userReaction.dataValues['unreceived'] = true;
    }

    const userReactionReceivedDeleted: UserReactionReceived[] = [
      ...userReactionReceived,
    ].filter((c) => c.type === UserReactionReceivedType.deleted);
    const userReactionReceivedSent: UserReactionReceived[] = [
      ...userReactionReceived,
    ].filter((c) => c.type === UserReactionReceivedType.sent);

    const userReactions: UserReaction[] =
      await this.userReactionRepository.findAll({
        where: {
          id: {
            [Op.in]: userReactionReceivedSent.map((r) => r.userReactionId),
          },
        },
      });

    for (
      let i = 0;
      i < Math.ceil(userReactionReceivedDeleted.length / 20);
      i++
    ) {
      this.socketGateway.sendUserReaction(
        user.id,
        [...userReactionReceivedDeleted].splice(i * 20, 20).map((c) => {
          return {
            id: c.userReactionId,
            deleted: true,
          };
        }),
      );
    }

    const userReactionsIds: number[] = userReactions.map((r) =>
      user.id === r.recipientId ? r.senderId : r.recipientId,
    );
    const userReactionsUsers: User[] = await this.userRepository.findAll({
      attributes: { exclude: excludedUserAttributes },
      where: { id: { [Op.in]: userReactionsIds } },
    });
    const userReactionsWithUser: UserReaction[] = userReactions.map(
      (reaction: UserReaction) => {
        const anotherUserId: number =
          user.id === reaction.recipientId
            ? reaction.senderId
            : reaction.recipientId;
        reaction.dataValues['user'] = userReactionsUsers.find(
          (u) => u.id === anotherUserId,
        );
        return reaction;
      },
    );

    for (let i = 0; i < Math.ceil(userReactionsWithUser.length / 20); i++) {
      this.socketGateway.sendUserReaction(
        user.id,
        [...userReactionsWithUser].splice(i * 20, 20),
      );
    }

    return { success: true };
  }

  async setUserReactionReceived(
    user: User,
    setDto: SetUserReactionReceivedDto,
  ): Promise<SuccessInterface> {
    await this.userReactionReceivedRepository.update(
      { received: true },
      {
        where: {
          userId: user.id,
          deviceId: setDto.deviceId,
          userReactionId: setDto.reactionId,
        },
      },
    );
    return { success: true };
  }

  private async setUserReactionUnreceived(
    userId: number,
    userReactionId: number,
    type: UserReactionReceivedType,
  ): Promise<UserReactionReceived[]> {
    const userDevices: UserDevice[] = await this.userDeviceRepository.findAll({
      attributes: ['deviceId'],
      where: { userId },
    });

    const userReactionReceived: UserReactionReceived[] =
      await this.userReactionReceivedRepository.findAll({
        where: {
          userReactionId,
          userId,
          deviceId: { [Op.in]: userDevices.map((u) => u.deviceId) },
        },
      });

    await this.userReactionReceivedRepository.update(
      {
        type,
        received: false,
      },
      {
        where: {
          userReactionId,
          userId,
          deviceId: { [Op.in]: userDevices.map((u) => u.deviceId) },
        },
      },
    );

    const uncreatedReactionReceivedUserDevice: UserDevice[] = [
      ...userDevices,
    ].filter(
      (u) => !userReactionReceived.map((r) => r.deviceId).includes(u.deviceId),
    );
    if (!uncreatedReactionReceivedUserDevice.length)
      return userReactionReceived;

    const newReactionReceived: UserReactionReceived[] =
      await this.userReactionReceivedRepository.bulkCreate(
        uncreatedReactionReceivedUserDevice.map((u: UserDevice) => {
          return {
            userId,
            deviceId: u.deviceId,
            userReactionId,
            type,
            received: false,
          };
        }),
      );

    return [...userReactionReceived, ...newReactionReceived];
  }
}
