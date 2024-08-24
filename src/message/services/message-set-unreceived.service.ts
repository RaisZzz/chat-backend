import { Injectable } from '@nestjs/common';
import { InjectModel as InjectMongooseModule } from '@nestjs/mongoose';
import { InjectModel } from '@nestjs/sequelize';
import { Model } from 'mongoose';
import { MessageReceived } from '../message-received.model';
import { UserDevice } from '../../user/user-device.model';

@Injectable()
export class MessageSetUnreceivedService {
  constructor(
    @InjectModel(UserDevice) private userDeviceRepository: typeof UserDevice,
    @InjectMongooseModule(MessageReceived.name)
    private messageReceivedModel: Model<MessageReceived>,
  ) {}

  async setMessageUnreceived(
    chatId: number,
    messageUuid: string,
    userId: number,
  ): Promise<void> {
    const userDevices: UserDevice[] = await this.userDeviceRepository.findAll({
      attributes: ['deviceId'],
      where: { userId },
    });

    const messageReceivedExist: MessageReceived[] =
      await this.messageReceivedModel.find({
        messageUuid,
        deviceId: { $in: userDevices.map((u) => u.deviceId) },
        userId,
      });

    await this.messageReceivedModel.updateMany(
      {
        messageUuid,
        deviceId: { $in: userDevices.map((u) => u.deviceId) },
        userId,
      },
      { received: false },
    );

    const uncreatedMessageReceivedUserDevice: UserDevice[] = [
      ...userDevices,
    ].filter(
      (u) => !messageReceivedExist.map((m) => m.deviceId).includes(u.deviceId),
    );
    if (!uncreatedMessageReceivedUserDevice.length) return;

    await this.messageReceivedModel.insertMany(
      uncreatedMessageReceivedUserDevice.map((u: UserDevice) => {
        return {
          chatId,
          messageUuid,
          userId,
          deviceId: u.deviceId,
          received: false,
        };
      }),
    );
  }
}
