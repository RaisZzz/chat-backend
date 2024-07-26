import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFamilyPositionDto } from './dto/create-family-position.dto';

@Table({
  tableName: 'family_position',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class FamilyPosition extends Model<
  FamilyPosition,
  CreateFamilyPositionDto
> {
  @ApiProperty({ example: 1, description: 'ID семейного положения' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Разведена',
    description: 'Название семейного положения',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  @Column({ type: DataType.SMALLINT, allowNull: false })
  readonly sex: number;

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
