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
import { ApiProperty } from '@nestjs/swagger';

export class StatisticFilterDto extends OffsetDto {
  @ApiProperty({ example: 1, description: 'User sex', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @IsIn([0, 1])
  readonly sex: number;

  @ApiProperty({
    example: 1,
    description: 'User live place ID',
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
  readonly livePlaceId?: number[];

  @ApiProperty({ example: true, description: 'Show refund', required: false })
  @IsBoolean()
  @Transform((value) => [true, 'true'].includes(value.value))
  @IsOptional()
  readonly showRefunds: boolean;

  @ApiProperty({ example: '', description: 'Start date ISO', required: false })
  @IsISO8601()
  @IsOptional()
  readonly startDate: string;

  @ApiProperty({ example: 'asd', description: 'Search query', required: false })
  @IsString()
  @IsOptional()
  readonly search: string | null;
}
