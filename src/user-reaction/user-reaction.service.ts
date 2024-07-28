import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserReaction } from './user-reaction.model';
import { excludedUserAttributes, User } from '../user/user.model';
import { SendUserReactionDto } from './dto/send-user-reaction.dto';
import { Error, ErrorType } from '../error.class';
import { ChatService } from '../chat/chat.service';
import { Chat } from '../chat/chat.model';
import {
  UserReactionReceived,
  UserReactionReceivedType,
} from './user-reaction-received.model';
import { SuccessInterface } from '../base/success.interface';
import { SetUserReactionReceivedDto } from './dto/set-received.dto';
import { SocketGateway } from '../websockets/socket.gateway';
import { Op } from 'sequelize';
import { OffsetDto } from '../base/offset.dto';

@Injectable()
export class UserReactionService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserReactionReceived)
    private userReactionReceivedRepository: typeof UserReactionReceived,
    @InjectModel(UserReaction)
    private userReactionRepository: typeof UserReaction,
    private chatService: ChatService,
    private socketGateway: SocketGateway,
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
        offset: offsetDto.offset,
        limit: 20,
      });

    for (let i = 0; i < userReactions.length; i++) {
      const userReaction: UserReaction = userReactions[i];
      const anotherUserId: number =
        userReaction.recipientId === user.id
          ? userReaction.senderId
          : userReaction.recipientId;

      userReaction['user'] = await this.userRepository.findOne({
        attributes: { exclude: excludedUserAttributes },
        where: { id: anotherUserId },
      });
    }

    return userReactions;
  }

  async send(user: User, sendDto: SendUserReactionDto): Promise<UserReaction> {
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

    // If like check message exist
    if (
      sendDto.isLiked &&
      (!sendDto.superLikeMsg || !sendDto.superLikeMsg.length)
    ) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'superLikeMsg' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check user has super likes on balance
    if (sendDto.isLiked && user.superLikes <= 0) {
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

    // Create or update reaction
    let reaction: UserReaction = await this.userReactionRepository.findOne({
      where: { senderId: user.id, recipientId: sendDto.toUserId },
    });

    if (reaction) {
      console.log(Date.now());
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

    const recipientReaction: UserReaction =
      await this.userReactionRepository.findOne({
        where: { senderId: sendDto.toUserId, recipientId: user.id },
      });

    if (!sendDto.isLiked) {
      // Delete chat if dislike
      const chat: Chat = await this.chatService.getChatWithTwoUsers(
        user.id,
        sendDto.toUserId,
      );

      if (chat) await this.chatService.deleteChat(chat.id);
      if (recipientReaction) {
        await recipientReaction.destroy();
        this.setUserReactionUnreceived(
          recipientReaction.senderId,
          recipientReaction.id,
          UserReactionReceivedType.deleted,
        );
      }
    } else {
      // Remove 1 super like from user balance
      await user.update({ superLikes: user.superLikes - 1 });

      if (recipientReaction && recipientReaction.isLiked) {
        // Create chat if above users likes
        await this.chatService.createChatWithTwoUsers(
          user.id,
          sendDto.toUserId,
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

    console.log(recipientExist.firstName, reaction.dataValues['user']);

    return reaction;
  }

  async sendAllUnreceivedReactions(user: User): Promise<SuccessInterface> {
    const userReactionReceived: UserReactionReceived[] =
      await this.userReactionReceivedRepository.findAll({
        where: {
          userId: user.id,
          received: false,
        },
      });

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

    for (let i = 0; i < Math.ceil(userReactions.length / 20); i++) {
      this.socketGateway.sendUserReaction(
        user.id,
        [...userReactions].splice(i * 20, 20),
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
  ): Promise<UserReactionReceived> {
    let userReactionReceived: UserReactionReceived =
      await this.userReactionReceivedRepository.findOne({
        where: { userReactionId, userId },
      });

    if (userReactionReceived) {
      await userReactionReceived.update({ type, received: false });
    } else {
      userReactionReceived = await this.userReactionReceivedRepository.create({
        userId,
        userReactionId,
        type,
        received: false,
      });
    }

    return userReactionReceived;
  }
}
