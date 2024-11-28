import { CreateNotificationDto } from './dto/send-notification.dto';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from './notification-type.enum';

@Table({
  tableName: 'notification',
  underscored: true,
})
export class Notification extends Model<Notification, CreateNotificationDto> {
  @ApiProperty({ example: 1, description: 'ID уведомления' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'From user ID' })
  @Column({ type: DataType.BIGINT, allowNull: false })
  from: number;

  @ApiProperty({ example: 1, description: 'To user ID' })
  @Column({ type: DataType.BIGINT, allowNull: false })
  to: number;

  @ApiProperty({
    example: NotificationType.verification,
    description: 'Notification type',
  })
  @Column({ type: DataType.SMALLINT, allowNull: false })
  type: NotificationType;

  @ApiProperty({ example: 'New message', description: 'Title' })
  @Column({ type: DataType.TEXT, allowNull: false })
  title: string;

  @ApiProperty({ example: 'From user', description: 'Body' })
  @Column({ type: DataType.TEXT, allowNull: false })
  body: string;

  @ApiProperty({ example: false, description: 'Notification is read' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRead: boolean;

  @ApiProperty({
    example: 1235432875345,
    description: 'Created at (UNIX timestamp)',
  })
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare createdAt: number;

  @ApiProperty({
    example: 1235432875345,
    description: 'Updated at (UNIX timestamp)',
  })
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare updatedAt: number;
}
