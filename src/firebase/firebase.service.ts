import { Injectable } from '@nestjs/common';
import { NotificationType } from '../notifications/notification-type.enum';
import { Chat } from '../chat/chat.model';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserDevice } from '../user/user-device.model';
import { Op } from 'sequelize';
import { join } from 'path';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectModel(UserDevice) private userDeviceRepository: typeof UserDevice,
    private redisService: RedisService,
  ) {}

  async sendNotification(
    userId: number,
    type: NotificationType,
    title?: string,
    body?: string,
    dataChat?: Chat,
    dataUser?: User,
  ) {
    const userDevices: UserDevice[] = await this.userDeviceRepository.findAll({
      attributes: [
        'fcmToken',
        'reactionsNotificationsEnabled',
        'messagesNotificationsEnabled',
        'messagesReactionsNotificationsEnabled',
      ],
      where: { userId, fcmToken: { [Op.ne]: null } },
    });

    if (!userDevices.length) return;

    try {
      let disabled;

      if (
        type === NotificationType.message ||
        type === NotificationType.support
      ) {
        disabled = await this.redisService.get(
          `user_msg_notifications_${userId}`,
        );
      } else if (type === NotificationType.reaction) {
        disabled = await this.redisService.get(
          `user_reaction_notifications_${userId}`,
        );
      } else if (
        [NotificationType.like, NotificationType.dislike].includes(type)
      ) {
        disabled = await this.redisService.get(
          `user_candidates_notifications_${userId}`,
        );
      }

      if (disabled === 'false') {
        return;
      }

      const dataType = NotificationType[type];

      const data = {};
      if (type) {
        data['type'] = dataType.toString();
      }
      if (dataUser) {
        data['userId'] = dataUser.id.toString();
      }
      if (dataChat) {
        data['chat'] = JSON.stringify(dataChat);
      }

      for (const token of userDevices) {
        await this.sendFirebaseNotification(token, type, title, body, data);
      }
    } catch (e) {
      console.log('FIREBASE SEND NOTIFICATION ERROR ' + e);
    }
  }

  private async sendFirebaseNotification(
    userDevice: UserDevice,
    type: NotificationType,
    title: string,
    body: string,
    data: Record<string, any>,
  ) {
    // Check if user reactions notifications disabled
    if (
      [
        NotificationType.superlike,
        NotificationType.like,
        NotificationType.dislike,
        NotificationType.mutual,
      ].includes(type) &&
      !userDevice.reactionsNotificationsEnabled
    ) {
      return;
    }

    // Check if user messages notifications disabled
    if (
      [NotificationType.message, NotificationType.support].includes(type) &&
      !userDevice.messagesNotificationsEnabled
    ) {
      return;
    }

    // Check if user messages reactions notifications disabled
    if (
      type === NotificationType.reaction &&
      !userDevice.messagesReactionsNotificationsEnabled
    ) {
      return;
    }

    // Send request to FCM
    const message = {
      token: userDevice.fcmToken,
      notification: { title: title ?? '', body: body ?? '' },
      data,
    };

    try {
      await fetch(
        'https://fcm.googleapis.com/v1/projects/tidy-federation-375304/messages:send',
        {
          headers: {
            Authorization: `Bearer ${await this.generateToken()}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ message }),
        },
      );
    } catch (e) {
      console.error('SEND FCM ERROR', e);
    }
  }

  private async generateToken(): Promise<string> {
    const auth = new GoogleAuth({
      keyFile: join(__dirname, '../..', 'firebase-adminsdk-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    await auth.getClient();
    return await auth.getAccessToken();
  }
}
