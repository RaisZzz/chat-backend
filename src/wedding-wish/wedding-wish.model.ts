import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWeddingWishDto } from './dto/create-wedding-wish.dto';

@Table({
  tableName: 'wedding_wish',
  createdAt: false,
  updatedAt: false,
  underscored: true,
})
export class WeddingWish extends Model<WeddingWish, CreateWeddingWishDto> {
  @ApiProperty({ example: 1, description: 'ID пожелания после свадьбы' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Высшее',
    description: 'Название пожелания после свадьбы',
  })
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
