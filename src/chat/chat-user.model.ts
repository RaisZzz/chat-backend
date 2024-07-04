import {
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Chat } from './chat.model';
import { User } from '../user/user.model';

@Table({ tableName: 'chat_user', underscored: true, timestamps: false })
export class ChatUser extends Model<ChatUser> {
  @Column({ type: DataType.INTEGER, allowNull: false })
  chatId: number;

  @BelongsTo(() => Chat, 'chatId')
  chat: Chat;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;
}
