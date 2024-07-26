import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePlaceWishDto } from './dto/create-place-wish.dto';

@Table({
  tableName: 'place_wish',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class PlaceWish extends Model<PlaceWish, CreatePlaceWishDto> {
  @ApiProperty({ example: 1, description: 'ID пожелания местожительства' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Имеется своё жилье',
    description: 'Название пожелания местожительства',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  @Column({ type: DataType.SMALLINT, allowNull: false })
  sex: number;

  @ApiProperty({ example: 'Divorced', description: 'Название на английском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title_en: string;

  @ApiProperty({ example: 'Ajrashgan', description: 'Название на узбекском' })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;
}
