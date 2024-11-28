import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Pavel', description: 'First name', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly firstName?: string;

  @ApiProperty({ example: 'Pavel', description: 'Last name', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly lastName?: string;

  @ApiProperty({
    example: '',
    description: 'Birthdate ISO8601',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  readonly birthdate?: string;

  @ApiProperty({ examples: [0, 1], description: 'Sex', required: false })
  @IsIn([0, 1])
  @IsOptional()
  readonly sex?: number;

  @ApiProperty({
    example: 37.452343,
    description: 'Geo latitude',
    required: false,
  })
  @IsLatitude()
  @IsOptional()
  readonly geo_lat?: number;

  @ApiProperty({
    example: 37.452343,
    description: 'Geo longitude',
    required: false,
  })
  @IsLongitude()
  @IsOptional()
  readonly geo_lon?: number;

  @ApiProperty({ example: 1, description: 'Live place ID', required: false })
  @IsInt()
  @IsOptional()
  readonly livePlaceId?: number;

  @ApiProperty({ example: 1, description: 'Birth place ID', required: false })
  @IsInt()
  @IsOptional()
  readonly birthPlaceId?: number;

  @ApiProperty({ example: 1, description: 'Parents ID', required: false })
  @IsInt()
  @IsOptional()
  readonly parentsId?: number;

  @ApiProperty({ example: 1, description: 'Organisation ID', required: false })
  @IsInt()
  @IsOptional()
  readonly organisationId?: number;

  @ApiProperty({
    example: 1,
    description: 'Family position ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  readonly familyPositionId?: number;

  @ApiProperty({ example: 1, description: 'Religion ID', required: false })
  @IsInt()
  @IsOptional()
  readonly religionId?: number;

  @ApiProperty({ example: 1, description: 'Has children ID', required: false })
  @IsInt()
  @IsOptional()
  readonly hasChildrenId?: number;

  @ApiProperty({ example: 1, description: 'Education ID', required: false })
  @IsInt()
  @IsOptional()
  readonly educationId?: number;

  @ApiProperty({ example: false, description: 'Read namaz', required: false })
  @IsBoolean()
  @IsOptional()
  readonly readNamaz?: boolean;

  @ApiProperty({ example: false, description: 'Wears hijab', required: false })
  @IsBoolean()
  @IsOptional()
  readonly wearsHijab?: boolean;

  @ApiProperty({ example: false, description: 'Has parents', required: false })
  @IsBoolean()
  @IsOptional()
  readonly hasParents?: boolean;

  @ApiProperty({ example: '', description: 'About user', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly requirements?: string;

  @ApiProperty({
    example: [1, 2],
    description: 'Languages IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly languagesIds?: number[];

  @ApiProperty({
    example: [1, 2],
    description: 'Place wishes IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly placeWishesIds?: number[];

  @ApiProperty({
    example: [1, 2],
    description: 'Wedding wishes IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly weddingWishesIds?: number[];

  @ApiProperty({
    example: [1, 2],
    description: 'Main qualities IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly mainQualitiesIds?: number[];

  @ApiProperty({
    example: [1, 2],
    description: 'Specialities IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly specialitiesIds?: number[];

  @ApiProperty({
    example: [1, 2],
    description: 'Interests IDs',
    required: false,
  })
  @IsInt({ each: true })
  @IsOptional()
  readonly interestsIds?: number[];

  @ApiProperty({
    example: true,
    description: 'Tutorial is done',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly tutorialDone?: boolean;
}
