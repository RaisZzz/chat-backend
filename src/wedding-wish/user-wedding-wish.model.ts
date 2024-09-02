import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { WeddingWish } from './wedding-wish.model';

@Table({
  tableName: 'user_wedding_wish',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserWeddingWish extends Model<UserWeddingWish> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => WeddingWish)
  @Column({ type: DataType.INTEGER, allowNull: false })
  weddingWishId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
