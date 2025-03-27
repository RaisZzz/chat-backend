import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Table({
  tableName: 'purchase',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Purchase extends Model<Purchase, CreatePurchaseDto> {
  @ApiProperty({ example: 1, description: 'ID товара' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'silver', description: 'name товара (unique)' })
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name: string;

  @ApiProperty({ example: 'Подписка VIP', description: 'Название товара' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({
    example: 'Subscribe VIP',
    description: 'Название товара (на английском)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_en: string;

  @ApiProperty({
    example: 'Sub VIP',
    description: 'Название товара (на узбекском)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'Sub VIP',
    description: 'Название товара (на узбекском кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (на английском)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  description_en: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (на узбекском)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  description_uz: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (на узбекском кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  description_uz_cyr: string;

  @ApiProperty({ example: 300000, description: 'Стоимость (в тиинах)' })
  @Column({ type: DataType.BIGINT, allowNull: false })
  price: string;

  @ApiProperty({ example: true, description: 'Подписка или нет' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isSubscribe: boolean;

  @ApiProperty({
    example: 5,
    description: 'Если подписка, то на сколько дней дается',
  })
  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  expireDays: number;

  @ApiProperty({ example: true, description: 'Активна или нет' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true, allowNull: false })
  active: boolean;

  @ApiProperty({
    example: 10,
    description: 'Сколько начислится суперлайков',
  })
  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  superLikes: number;

  @ApiProperty({
    example: 10,
    description: 'Сколько начислится возвратов',
  })
  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  returns: number;
}
