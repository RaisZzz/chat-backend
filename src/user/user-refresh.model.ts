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
  tableName: 'user_refresh',
  underscored: true,
})
export class UserRefresh extends Model<UserRefresh> {
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
}
