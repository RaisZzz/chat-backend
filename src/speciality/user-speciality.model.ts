import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Speciality } from './speciality.model';

@Table({
  tableName: 'user_specialities',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserSpeciality extends Model<UserSpeciality> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Speciality)
  @Column({ type: DataType.INTEGER, allowNull: false })
  specialityId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
