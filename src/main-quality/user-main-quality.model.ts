import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { MainQuality } from './main-quality.model';

@Table({
  tableName: 'user_main_quality',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserMainQuality extends Model<UserMainQuality> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => MainQuality)
  @Column({ type: DataType.INTEGER, allowNull: false })
  mainQualityId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
