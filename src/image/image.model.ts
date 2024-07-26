import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateImageDto } from './dto/create-image.dto';
import { User } from '../user/user.model';
import { UserImages } from './user-image.model';

@Table({ tableName: 'image', underscored: true })
export class Image extends Model<Image, CreateImageDto> {
  @ApiProperty({ example: 1, description: 'ID изображения' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: '/uploads/1.png', description: 'Путь к изображению' })
  @Column({ type: DataType.STRING, allowNull: false })
  path: string;

  @ApiProperty({ example: 350, description: 'Ширина изображения' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  width: number;

  @ApiProperty({ example: 150, description: 'Высота изображения' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  height: number;

  @ApiProperty({ example: 2304, description: 'Размер изображения (в байтах)' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  size: number;

  @BelongsToMany(() => User, () => UserImages)
  users: User[];
}
