import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class MessageReceived {
  @Prop({ required: true, type: String })
  messageUuid: string;

  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: String })
  deviceId: string;

  @Prop({ required: true, type: Number })
  chatId: number;

  @Prop({ required: true, type: Boolean })
  received: boolean;
}

export const messageReceivedModel =
  SchemaFactory.createForClass(MessageReceived);
