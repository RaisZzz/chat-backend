import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/user/user.model';

@Table({ tableName: 'report', underscored: true })
export class Report extends Model<Report, CreateReportDto> {
  @ApiProperty({ example: 1, description: 'ID жалобы' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'ID отправителя жалобы' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  ownerId: number;

  @BelongsTo(() => User, 'ownerId')
  owner: User;

  @ApiProperty({ example: 1, description: 'ID на кого жалоба' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  reportedId: number;

  @BelongsTo(() => User, 'reportedId')
  reported: User;

  @ApiProperty({ example: 'Asd', description: 'Ответ поддержки' })
  @Column({ type: DataType.TEXT })
  answer: string;

  @ApiProperty({ example: 'Мат', description: 'Текст жалобы' })
  @Column({ type: DataType.TEXT, allowNull: false })
  text: string;

  @ApiProperty({ example: false, description: 'Жалоба решена' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  resolved: boolean;
}
