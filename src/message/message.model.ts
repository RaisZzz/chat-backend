import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export enum SystemMessageType {
  Default,
  ChatCreated,
  ShareConfirm,
}

@Schema()
export class Message {
  @Prop({ required: true, unique: true, type: SchemaTypes.String })
  uuid: string;

  @Prop({ type: SchemaTypes.String })
  text: string;

  @Prop({ required: true, type: SchemaTypes.Number })
  ownerId: number;

  @Prop({ required: true, type: SchemaTypes.Number })
  chatId: number;

  @Prop({ type: SchemaTypes.Number })
  voiceId: number;

  @Prop({
    required: true,
    enum: SystemMessageType,
    default: SystemMessageType.Default,
  })
  systemId: SystemMessageType;

  @Prop({ type: SchemaTypes.Number })
  reportId: number;

  @Prop({ type: [SchemaTypes.Number] })
  imagesIds: number[];

  @Prop({ required: true, type: SchemaTypes.Boolean, default: false })
  liked: boolean;

  @Prop({ required: true, type: SchemaTypes.Boolean, default: false })
  isRead: boolean;

  @Prop({ required: true, type: SchemaTypes.Number })
  createdAt: number;
}

export const messageModel = SchemaFactory.createForClass(Message);
