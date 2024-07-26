import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationType } from '../notifications/notification-type.enum';
import { Chat } from '../chat/chat.model';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/user.model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../../firebase-credentials.json');

@Injectable()
export class FirebaseService {
  private admin;

  constructor(private redisService: RedisService) {
    this.init().then(() => console.log('FIREBASE APP INITIALIZED'));
  }

  async init() {
    try {
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'nikohlink-test',
      });
    } catch (e) {
      console.log(`FIREBASE CONNECT ERROR ` + e);
      this.admin = admin;
    }
  }

  async sendNotification(
    userId: number,
    type: NotificationType,
    title?: string,
    body?: string,
    dataChat?: Chat,
    dataUser?: User,
  ) {
    const token = await this.redisService.get(`firebase_user_${userId}`);
    if (token && token.length) {
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
          data['chat'] = JSON.stringify({
            id: dataChat.id,
            firstName: dataChat.dataValues['firstName'],
            lastName: dataChat.dataValues['lastName'],
            ownerId: dataChat.dataValues['users'],
            unread: dataChat.dataValues['unread'],
            type: dataChat.type,
            image: dataChat.dataValues['image'],
            canWrite: dataChat.dataValues['canWrite'],
            hasSuperLike: dataChat.dataValues['hasSuperLike'],
          });
        }

        console.log('SENDING FIREBASE with TOKEN: ' + token);
        const firebaseData = {
          notification: {
            title: title ?? '',
            body: body ?? '',
            sound: 'default',
          },
          data,
        };
        await this.admin.messaging().sendToDevice(token, firebaseData);
      } catch (e) {
        console.log('FIREBASE SEND NOTIFICATION ERROR ' + e);
      }
    }
  }
}
