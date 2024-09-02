import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCityDto } from './dto/create-city.dto';

@Table({
  tableName: 'city',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class City extends Model<City, CreateCityDto> {
  @ApiProperty({ example: 1, description: 'ID города' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'lorem', description: 'Название на Русском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: 'lorem', description: 'Название на Английском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title_en: string;

  @ApiProperty({ example: 'lorem', description: 'Название на Узбекистанском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кирилица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;
}
