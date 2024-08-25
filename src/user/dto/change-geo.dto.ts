import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeGeoDto {
  @ApiProperty({ example: 54.32122, description: 'Широта' })
  @IsLatitude()
  @ValidateIf((object, value) => value !== null)
  latitude: number | null;

  @ApiProperty({ example: 54.32122, description: 'Долгота' })
  @IsLongitude()
  @ValidateIf((object, value) => value !== null)
  longitude: number | null;

  @ApiProperty({ example: 'secret', description: 'md5(secret + token)' })
  @IsString()
  @IsNotEmpty()
  secret: string;
}
