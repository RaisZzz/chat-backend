import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class MessageReceived {
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true, type: String })
  messageUuid: string;

  @Prop({ required: true, type: Number })
  userId: number;
}

export const messageReceivedModel =
  SchemaFactory.createForClass(MessageReceived);
