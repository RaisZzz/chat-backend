import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.model';
import { UserRoles } from './user-role.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Table({
  tableName: 'role',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Role extends Model<Role, CreateRoleDto> {
  @ApiProperty({ example: 1, description: 'ID роли' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'admin', description: 'Значение роли пользователя' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  value: string;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @BelongsToMany(() => User, () => UserRoles)
  users: User[];
}
