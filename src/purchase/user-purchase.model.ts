import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/user.model';
import { Purchase } from './purchase.model';

@Table({ tableName: 'user_purchase', underscored: true })
export class UserPurchase extends Model<UserPurchase> {
  @ApiProperty({ example: 1, description: 'ID покупки' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @BelongsTo(() => Purchase)
  purchase: Purchase;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @ForeignKey(() => Purchase)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  purchaseId: number;

  @ApiProperty({ example: 1, description: 'ID транзакции' })
  @Column({
    type: DataType.STRING,
  })
  transactionId: string;

  @BelongsTo(() => User)
  user: User;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  // @ApiProperty({ example: 'waiting', description: 'Статус оплаты' })
  // @Column({
  //   type: DataType.STRING,
  //   defaultValue: 'waiting',
  // })
  // status: string;

  @ApiProperty({ example: 1399114284039, description: 'Время платежа' })
  @Column({
    type: DataType.BIGINT,
  })
  paycomTime: number;

  @ApiProperty({ example: 0, description: 'Статус' })
  @Column({
    type: DataType.INTEGER,
  })
  state: number;

  @ApiProperty({ example: 0, description: 'Сумма платежа (в тиинах)' })
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  amount: string;

  @ApiProperty({ example: 0, description: 'Причина отмены' })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  reason: number;

  @ApiProperty({ example: 12393249123, description: 'Время биллинга' })
  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  performTime: string;

  @ApiProperty({ example: 12393249123, description: 'Время отмены' })
  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  cancelTime: string;

  @ApiProperty({ example: 'payme', description: 'Имя оператора' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  operator: string;
}
