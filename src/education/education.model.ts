import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEducationDto } from './dto/create-education.dto';

@Table({
  tableName: 'education',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class Education extends Model<Education, CreateEducationDto> {
  @ApiProperty({ example: 1, description: 'ID образования' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Высшее', description: 'Название образования' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  @Column({ type: DataType.SMALLINT, allowNull: false })
  readonly sex: number;

  @ApiProperty({ example: 'Higher', description: 'Название на английском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title_en: string;

  @ApiProperty({
    example: "Oliy ma'lumot",
    description: 'Название на узбекском',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;
}
