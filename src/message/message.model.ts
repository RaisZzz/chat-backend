import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

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

  @Prop({ required: true, type: SchemaTypes.Number })
  createdAt: number;
}

export const messageModel = SchemaFactory.createForClass(Message);
