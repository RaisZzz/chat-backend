import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateVoiceDto } from './dto/create-voice.dto';

@Table({ tableName: 'voice', underscored: true })
export class Voice extends Model<Voice, CreateVoiceDto> {
  @ApiProperty({ example: 1, description: 'ID голосового сообщения' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '/uploads/1.mp4',
    description: 'Путь к голосовому сообщению',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  path: string;

  @ApiProperty({ example: 2304, description: 'Размер аудио (в байтах)' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  size: number;

  @ApiProperty({
    example: 2304,
    description: 'Длительность аудио (в секундах)',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  seconds: number;

  @ApiProperty({
    example: [0.1, 0.3, 0.5],
    description: 'WaveForm',
  })
  @Column({ type: DataType.ARRAY(DataType.DOUBLE), allowNull: false })
  waveFormLines: number[];
}
