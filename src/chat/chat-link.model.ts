import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateChatLinkDto } from './dto/create-chat-link.dto';

@Table({ tableName: 'chat_link', underscored: true })
export class ChatLink extends Model<ChatLink, CreateChatLinkDto> {
  @ApiProperty({ example: 1, description: 'ID ссылки' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'ID чата' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  chatId: number;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ example: 'kjdf28374nakd89123', description: 'UUID' })
  @Column({ type: DataType.TEXT, allowNull: false })
  uuid: string;

  @ApiProperty({
    example: 30,
    description: 'Время действия ссылки (в минутах)',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  expireTime: number;

  @ApiProperty({
    example: false,
    description: 'Одобрение вторым пользователем',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  confirmed: boolean;

  @ApiProperty({
    example: false,
    description: 'Отклонение вторым пользователем',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  canceled: boolean;
}
