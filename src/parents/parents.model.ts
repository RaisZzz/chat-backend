import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateParentsDto } from './dto/create-parents.dto';

@Table({
  tableName: 'parents',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class Parents extends Model<Parents, CreateParentsDto> {
  @ApiProperty({ example: 1, description: 'ID "родителей"' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Высшее', description: 'Название "родителей"' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title: string;

  @ApiProperty({ example: 'Higher', description: 'Название на английском' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_en: string;

  @ApiProperty({
    example: "Oliy ma'lumot",
    description: 'Название на узбекском',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;
}
