import {
  IsArray,
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OffsetDto } from '../../base/offset.dto';

export class GetUsersDto extends OffsetDto {
  @IsInt({ each: true })
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly usersIds: number[];

  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly livePlaceId?: number[];

  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly birthPlaceId?: number[];

  @ApiProperty({
    example: 30,
    description: 'Минимальный возраст',
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly ageMin?: number;

  @ApiProperty({
    example: 50,
    description: 'Максимальный возраст',
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly ageMax?: number;

  @ApiProperty({ example: [], description: 'Образование', required: false })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly educations?: number[];

  @ApiProperty({ example: [], description: 'Специальности', required: false })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly specialities?: number[];

  @ApiProperty({ example: [], description: 'Вид организации', required: false })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly organisationTypes?: number[];

  @ApiProperty({
    example: [true],
    description: 'Читает намаз',
    required: false,
  })
  @IsBoolean({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly readNamaz?: boolean[];

  @ApiProperty({
    example: [true],
    description: 'Носит хиджаб',
    required: false,
  })
  @IsBoolean({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly wearsHijab?: boolean[];

  @ApiProperty({
    example: [],
    description: 'Семейное положение',
    required: false,
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly familyPositions?: number[];

  @ApiProperty({
    example: [],
    description: 'Религия',
    required: false,
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly religions?: number[];

  @ApiProperty({
    example: [],
    description: 'Есть дети',
    required: false,
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly hasChildrens?: number[];

  @ApiProperty({
    example: [],
    description: 'Пожелания местожительства',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly placeWishes?: Array<number | null>;

  @ApiProperty({
    example: [],
    description: 'Пожелания после свадьбы',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly weddingWishes?: Array<number | null>;

  @ApiProperty({
    example: [],
    description: 'Главные качества',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly mainQualities?: Array<number | null>;

  @ApiProperty({
    example: [],
    description: 'Родители',
    required: false,
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly parents?: number[];

  @ApiProperty({
    example: [],
    description: 'Интересы',
    required: false,
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly interests?: number[];

  @ApiProperty({
    example: [],
    description: 'Знание языков',
    required: false,
  })
  @Transform((value) => {
    if (!Array.isArray(value.value)) {
      return value.value ? JSON.parse(value.value) || [] : [];
    } else {
      return value.value;
    }
  })
  readonly languages?: number[];

  @IsLatitude()
  @Type(() => Number)
  @IsOptional()
  readonly geoLat: number | null;

  @IsLongitude()
  @Type(() => Number)
  @IsOptional()
  readonly geoLon: number | null;
}
