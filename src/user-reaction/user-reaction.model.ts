import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { CreateUserReactionDto } from './dto/create-user-reaction.dto';

@Table({
  tableName: 'user_reaction',
  underscored: true,
})
export class UserReaction extends Model<UserReaction, CreateUserReactionDto> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  senderId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  recipientId: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isLiked: boolean;

  @Column({ type: DataType.TEXT })
  superLikeMsg: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRead: boolean;

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
