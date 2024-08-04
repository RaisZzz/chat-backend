import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInterestDto } from './dto/create-interest.dto';

@Table({
  tableName: 'interest',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Interest extends Model<Interest, CreateInterestDto> {
  @ApiProperty({ example: 1, description: 'ID интереса' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Спорт', description: 'Название интереса' })
  @Column({ type: DataType.TEXT, unique: true, allowNull: false })
  title: string;

  @ApiProperty({ example: 'Divorced', description: 'Название на английском' })
  @Column({ type: DataType.TEXT, unique: true, allowNull: false })
  title_en: string;

  @ApiProperty({ example: 'Ajrashgan', description: 'Название на узбекском' })
  @Column({ type: DataType.TEXT, unique: true, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.TEXT, allowNull: false })
  title_uz_cyr: string;

  @ApiProperty({
    example: 'car',
    description: 'Имя иконки',
  })
  @Column({ type: DataType.TEXT })
  iconName: string;
}
