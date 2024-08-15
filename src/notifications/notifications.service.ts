import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/send-notification.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { SocketGateway } from '../websockets/socket.gateway';
import { excludedUserAttributes, User } from '../user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from 'src/chat/chat.model';
import { Notification } from './notifications.model';
import { NotificationType } from './notification-type.enum';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { Error, ErrorType } from '../error.class';
import { OffsetDto } from '../base/offset.dto';
import { UserReaction } from '../user-reaction/user-reaction.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class NotificationsService {
  constructor(
    private firebaseService: FirebaseService,
    private socketGateway: SocketGateway,
    @InjectModel(Notification)
    private notificationRepository: typeof Notification,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserReaction)
    private userReactionRepository: typeof UserReaction,
    private sequelize: Sequelize,
  ) {}

  private logger: Logger = new Logger('Notifications');

  async sendNotification(
    sendDto: CreateNotificationDto,
    withoutSave = false,
    dataChat?: Chat,
    dataUser?: User,
  ): Promise<Notification> {
    console.log('SEND NOTIFICATION', withoutSave);
    try {
      await this.firebaseService.sendNotification(
        sendDto.to,
        sendDto.type,
        sendDto.title,
        sendDto.body,
        dataChat,
        dataUser,
      );
    } catch (e) {
      this.logger.error('SEND FIREBASE NOTIFICATION ERROR ' + e);
    }

    if (withoutSave) return;

    const notification: Notification =
      await this.notificationRepository.create(sendDto);
    await this.socketGateway.sendNotification(notification);
  }

  async readNotification(
    user: User,
    readDto: ReadNotificationDto,
  ): Promise<any> {
    const notification: Notification =
      await this.notificationRepository.findOne({
        where: {
          id: readDto.id,
          to: user.id,
          isRead: false,
        },
      });

    if (!notification) {
      throw new HttpException(
        new Error(ErrorType.BadFields, { field: 'id' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    await notification.update({ isRead: true });

    return { success: true };
  }

  async getAll(user: User, offsetDto: OffsetDto) {
    const offset: number = offsetDto.offset ?? 0;
    const limit = 20;

    const notifications: Notification[] =
      await this.notificationRepository.findAll({
        where: {
          to: user.id,
        },
        offset,
        limit,
        order: [['createdAt', 'DESC']],
      });

    for (const notification of notifications) {
      notification.dataValues['unlock'] = true;
      notification.dataValues['disabled'] = false;

      if (
        [
          NotificationType.like,
          NotificationType.mutual,
          NotificationType.superlike,
        ].includes(notification.type)
      ) {
        const userFrom = await this.userRepository.findOne({
          where: { id: notification.from },
          include: { all: true },
          attributes: { exclude: excludedUserAttributes },
        });

        if (userFrom) {
          notification.dataValues['user'] = userFrom;
          notification.dataValues['image'] = userFrom.photos[0];
        }

        // check if disabled
        const likeCheck = await this.userReactionRepository.findOne({
          where: {
            senderId: notification.from,
            recipientId: notification.to,
            isLiked: true,
          },
        });
        if (!likeCheck) {
          const dislikeToCheck = await this.userReactionRepository.findOne({
            where: {
              senderId: notification.to,
              recipientId: notification.from,
            },
          });
          if (dislikeToCheck?.isLiked === false) {
            notification.dataValues['disabled'] = true;
          } else {
            const dislikeFromCheck = await this.userReactionRepository.findOne({
              where: {
                senderId: notification.from,
                recipientId: notification.to,
              },
            });
            if (dislikeFromCheck) {
              notification.dataValues['disabled'] = !dislikeFromCheck.isLiked;
              notification.dataValues['candidateId'] = dislikeFromCheck.id;
            } else {
              notification.dataValues['disabled'] = true;
            }
          }
        }
      }

      if (
        notification.type === NotificationType.mutual &&
        notification.dataValues['disabled'] !== true
      ) {
        const anotherUserId: number =
          notification.from === user.id ? notification.to : notification.from;
        const [chatsResponse] = await this.sequelize.query(`
          SELECT * FROM
          (SELECT *,
            (SELECT ARRAY(SELECT user_id FROM "chat_user" WHERE chat_id = "chat".id)) as "users"
            FROM "chat"
          ) asd
          WHERE users = ARRAY[${user.id}, ${anotherUserId}]
          OR users = ARRAY[${anotherUserId}, ${user.id}]
        `);
        const chats: Chat[] = chatsResponse as Chat[];
        if (chats.length) {
          notification.dataValues['chat'] = chats[0];
        }
      }
    }

    if (notifications.length) {
      this.notificationRepository.update(
        {
          isRead: true,
        },
        {
          where: {
            to: user.id,
          },
        },
      );
    }

    return notifications;
  }
}
