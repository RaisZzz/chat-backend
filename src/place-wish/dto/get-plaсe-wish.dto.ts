import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPlaEWishDto {
  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  @IsInt()
  @Min(0)
  @Max(1)
  readonly sex: number;
}
