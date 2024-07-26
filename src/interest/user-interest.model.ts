import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Interest } from './interest.model';

@Table({
  tableName: 'user_interests',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserInterest extends Model<UserInterest> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Interest)
  @Column({ type: DataType.INTEGER, allowNull: false })
  interestId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
