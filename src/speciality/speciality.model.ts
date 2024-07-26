import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSpecialityDto } from './dto/create-speciality.dto';

@Table({
  tableName: 'speciality',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Speciality extends Model<Speciality, CreateSpecialityDto> {
  @ApiProperty({ example: 1, description: 'ID специальности' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Экономист', description: 'Название специальности' })
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
