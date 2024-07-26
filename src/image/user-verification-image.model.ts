import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Image } from './image.model';

@Table({
  tableName: 'user_verification_image',
  createdAt: true,
  updatedAt: false,
  underscored: true,
})
export class UserVerificationImages extends Model<UserVerificationImages> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Image)
  @Column({ type: DataType.INTEGER, allowNull: false })
  imageId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
