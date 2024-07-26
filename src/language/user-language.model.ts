import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Language } from './language.model';

@Table({
  tableName: 'user_language',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class UserLanguage extends Model<UserLanguage> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Language)
  @Column({ type: DataType.INTEGER, allowNull: false })
  languageId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;
}
