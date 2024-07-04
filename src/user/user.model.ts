import { Model, Column, DataType, Table } from 'sequelize-typescript';
import { CreateUserDto } from './dto/create-user.dto';

@Table({ tableName: 'user', underscored: true })
export class User extends Model<User, CreateUserDto> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  login: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  password: string;

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
