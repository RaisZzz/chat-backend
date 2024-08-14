import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class GetImageDto {
  @IsInt()
  @Type(() => Number)
  readonly id: number;

  @IsString()
  @IsOptional()
  readonly size: string;
}
