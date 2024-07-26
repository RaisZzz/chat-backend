import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDocDto } from './dto/create-doc.dto';

@Table({
  tableName: 'doc_text',
  underscored: true,
  createdAt: false,
  updatedAt: false,
})
export class DocText extends Model<DocText, CreateDocDto> {
  @ApiProperty({ example: 1, description: 'ID' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: false,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Lorem ipsum...', description: 'Публичная оферта' })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  publicOffer: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Публичная оферта (на английском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  publicOffer_en: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Публичная оферта (на узбекском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  publicOffer_uz: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Публичная оферта (на узбекском кириллица)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  publicOffer_uz_cyr: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Политика конфиденциальности',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  privacyPolicy: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Политика конфиденциальности (на английском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  privacyPolicy_en: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Политика конфиденциальности (на узбекском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  privacyPolicy_uz: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Политика конфиденциальности (на узбекском кирилица)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  privacyPolicy_uz_сyr: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Правила безопасности',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  safetyRules: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Правила безопасности (на английском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  safetyRules_en: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Правила безопасности (на узбекском)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  safetyRules_uz: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Правила безопасности (на узбекском кириллица)',
  })
  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  safetyRules_uz_cyr: string;
}
