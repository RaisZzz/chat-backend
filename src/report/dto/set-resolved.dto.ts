import { IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SetResolvedDto {
  @IsInt()
  @Type(() => Number)
  readonly reportId: number;

  @IsBoolean()
  @Type(() => Boolean)
  readonly resolved: boolean;
}
