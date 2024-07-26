import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { PlaceWish } from './place-wish.model';

@Table({
  tableName: 'user_place_wish',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserPlaceWish extends Model<UserPlaceWish> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => PlaceWish)
  @Column({ type: DataType.INTEGER, allowNull: false })
  placeWishId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
