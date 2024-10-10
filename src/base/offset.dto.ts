import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OffsetDto {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  readonly offset?: number;
}
