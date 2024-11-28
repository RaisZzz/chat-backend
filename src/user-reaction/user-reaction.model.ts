import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { CreateUserReactionDto } from './dto/create-user-reaction.dto';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'user_reaction',
  underscored: true,
})
export class UserReaction extends Model<UserReaction, CreateUserReactionDto> {
  @ApiProperty({ example: 1, description: 'User reaction ID' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'Sender user ID' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  senderId: number;

  @ApiProperty({ example: 1, description: 'Recipient user ID' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  recipientId: number;

  @ApiProperty({ example: true, description: 'Is liked' })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isLiked: boolean;

  @ApiProperty({ example: 'hello', description: 'Reaction message text' })
  @Column({ type: DataType.TEXT })
  superLikeMsg: string;

  @ApiProperty({ example: true, description: 'Is read' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRead: boolean;

  @ApiProperty({
    example: 174327234234,
    description: 'Created at (UNIX timestamp)',
  })
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare createdAt: number;

  @ApiProperty({
    example: 174327234234,
    description: 'Updated at (UNIX timestamp)',
  })
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare updatedAt: number;
}
