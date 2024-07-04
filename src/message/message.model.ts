import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Message {
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop(String)
  text: string;

  @Prop({ required: true, type: Number })
  ownerId: number;

  @Prop({ required: true, type: Number })
  chatId: number;
}

export const messageModel = SchemaFactory.createForClass(Message);
