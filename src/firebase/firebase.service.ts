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
      attributes: ['fcmToken'],
      where: { userId, fcmToken: { [Op.ne]: null } },
    });
    const userTokens: string[] = userDevices.map((d) => d.fcmToken);

    if (!userTokens.length) return;

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

      console.log('SENDING FIREBASE with TOKENS: ' + userTokens);
      const message = {
        token: userTokens[0],
        notification: {
          title: title ?? '',
          body: body ?? '',
        },
        data,
      };

      const response = await fetch(
        'https://fcm.googleapis.com/v1/projects/nikohlink-test/messages:send',
        {
          headers: {
            Authorization: `Bearer ${await this.generateToken()}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ message }),
        },
      );
      const json = await response.json();

      console.log(json);
      console.log(json?.error?.details);
    } catch (e) {
      console.log('FIREBASE SEND NOTIFICATION ERROR ' + e);
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
