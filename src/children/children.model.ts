import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateChildrenDto } from './dto/create-children.dto';

@Table({
  tableName: 'children',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Children extends Model<Children, CreateChildrenDto> {
  @ApiProperty({ example: 1, description: 'ID детей' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Есть',
    description: 'Дети',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title: string;

  @ApiProperty({ example: 'Divorced', description: 'Название на английском' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_en: string;

  @ApiProperty({ example: 'Ajrashgan', description: 'Название на узбекском' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;
}
