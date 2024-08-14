import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'user_device',
  underscored: true,
})
export class UserDevice extends Model<UserDevice> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    unique: true,
    allowNull: false,
  })
  refreshToken: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  ip: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @Column({ type: DataType.TEXT })
  fcmToken: string | null;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare createdAt: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare updatedAt: number;
}
