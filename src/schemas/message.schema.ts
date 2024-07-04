import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Message {
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop(String)
  text: string;
}

export const messageSchema = SchemaFactory.createForClass(Message);
