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

  @Column({ type: DataType.BIGINT, allowNull: false })
  from: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  to: number;

  @Column({ type: DataType.SMALLINT, allowNull: false })
  type: NotificationType;

  @Column({ type: DataType.TEXT, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  body: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRead: boolean;
}
