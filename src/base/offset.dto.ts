import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class OffsetDto {
  @IsInt()
  @Type(() => Number)
  readonly offset: number;
}
