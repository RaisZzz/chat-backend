import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly lastName?: string;

  @IsISO8601()
  @IsOptional()
  readonly birthdate?: string;

  @IsLatitude()
  @IsOptional()
  readonly geo_lat: number;

  @IsLongitude()
  @IsOptional()
  readonly geo_lon: number;

  @IsInt()
  @IsOptional()
  readonly livePlaceId: number;

  @IsInt()
  @IsOptional()
  readonly birthPlaceId: number;

  @IsInt()
  @IsOptional()
  readonly parentsId: number;

  @IsInt()
  @IsOptional()
  readonly organisationId: number;

  @IsInt()
  @IsOptional()
  readonly familyPositionId: number;

  @IsInt()
  @IsOptional()
  readonly religionId: number;

  @IsInt()
  @IsOptional()
  readonly hasChildrenId: number;

  @IsInt()
  @IsOptional()
  readonly educationId: number;

  @IsBoolean()
  @IsOptional()
  readonly readNamaz: boolean;

  @IsBoolean()
  @IsOptional()
  readonly wearsHijab: boolean;

  @IsBoolean()
  @IsOptional()
  readonly hasParents: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly requirements: string;

  @IsInt({ each: true })
  @IsOptional()
  readonly languagesIds: number[];

  @IsInt({ each: true })
  @IsOptional()
  readonly placeWishesIds: number[];

  @IsInt({ each: true })
  @IsOptional()
  readonly specialitiesIds: number[];

  @IsInt({ each: true })
  @IsOptional()
  readonly interestsIds: number[];

  @IsBoolean()
  @IsOptional()
  readonly tutorialDone: boolean;
}
