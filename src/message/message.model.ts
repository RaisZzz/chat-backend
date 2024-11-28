import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { ApiParam, ApiProperty } from '@nestjs/swagger';

export enum SystemMessageType {
  Default,
  ChatCreated,
  ShareConfirm,
}

@Schema()
export class Message {
  @ApiProperty({ example: 'uuid', description: 'UUID' })
  @Prop({ required: true, unique: true, type: SchemaTypes.String })
  uuid: string;

  @ApiProperty({ example: 'hello', description: 'text' })
  @Prop({ type: SchemaTypes.String })
  text: string;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @Prop({ required: true, type: SchemaTypes.Number })
  ownerId: number;

  @ApiProperty({ example: 1, description: 'Chat ID' })
  @Prop({ required: true, type: SchemaTypes.Number })
  chatId: number;

  @ApiProperty({ example: 1, description: 'Voice ID', required: false })
  @Prop({ type: SchemaTypes.Number })
  voiceId: number | null;

  @ApiProperty({
    enum: SystemMessageType,
    description: 'System message ID',
  })
  @Prop({
    required: true,
    enum: SystemMessageType,
    default: SystemMessageType.Default,
  })
  systemId: SystemMessageType;

  @ApiProperty({ example: 1, description: 'Report ID', required: false })
  @Prop({ type: SchemaTypes.Number })
  reportId: number | null;

  @ApiProperty({ example: [1, 2], description: 'Array of images ID' })
  @Prop({ type: [SchemaTypes.Number] })
  imagesIds: number[];

  @ApiProperty({ example: false, description: 'Message is liked' })
  @Prop({ required: true, type: SchemaTypes.Boolean, default: false })
  liked: boolean;

  @ApiProperty({ example: false, description: 'Message is read' })
  @Prop({ required: true, type: SchemaTypes.Boolean, default: false })
  isRead: boolean;

  @ApiProperty({
    example: 174058607,
    description: 'Created at (UNIX timestamp)',
  })
  @Prop({ required: true, type: SchemaTypes.Number })
  createdAt: number;

  @ApiProperty({
    example: 1,
    description: 'Chat share link ID',
    required: false,
  })
  @Prop({ type: SchemaTypes.Number })
  linkId: number | null;
}

export const messageModel = SchemaFactory.createForClass(Message);
