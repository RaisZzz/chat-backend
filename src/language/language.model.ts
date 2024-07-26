import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.model';
import { UserLanguage } from './user-language.model';
import { CreateLanguageDto } from './dto/create-language.dto';

@Table({
  tableName: 'language',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class Language extends Model<Language, CreateLanguageDto> {
  @ApiProperty({ example: 1, description: 'ID языка' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Русский', description: 'Название образования' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title: string;

  @ApiProperty({ example: 'Russian', description: 'Название на английском' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_en: string;

  @ApiProperty({
    example: 'Rus',
    description: 'Название на узбекском',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  title_uz_cyr: string;

  @BelongsToMany(() => User, () => UserLanguage)
  users: User[];
}
