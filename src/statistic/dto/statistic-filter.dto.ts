import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OffsetDto } from '../../base/offset.dto';

export class StatisticFilterDto extends OffsetDto {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @IsIn([0, 1])
  readonly sex: number;

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

  @IsBoolean()
  @Transform((value) => [true, 'true'].includes(value.value))
  @IsOptional()
  readonly showRefunds: boolean;

  @IsISO8601()
  @IsOptional()
  readonly startDate: string;

  @IsString()
  @IsOptional()
  readonly search: string | null;
}
