import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';
import { SendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const uuid: string = uuidv4();
    const message = new this.messageModel({ ...sendMessageDto, uuid });
    return await message.save();
  }
}
