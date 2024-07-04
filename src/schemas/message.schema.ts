import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Message {
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop(String)
  text: string;

  @Prop({ required: true, type: Number })
  ownerId: number;

  @Prop({ required: true, type: String })
  chatId: string;
}

export const messageSchema = SchemaFactory.createForClass(Message);
