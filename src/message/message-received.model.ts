import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema()
export class MessageReceived {
  @Prop({ required: true, unique: true, type: SchemaTypes.String })
  uuid: string;

  @Prop({ required: true, type: SchemaTypes.String })
  messageUuid: string;

  @Prop({ required: true, type: SchemaTypes.BigInt })
  userId: number;

  @Prop({ required: true, type: SchemaTypes.Boolean })
  received: boolean;
}

export const messageReceivedModel =
  SchemaFactory.createForClass(MessageReceived);
