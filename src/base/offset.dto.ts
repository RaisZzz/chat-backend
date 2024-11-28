import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OffsetDto {
  @ApiProperty({ example: 0, description: 'Offset', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  readonly offset?: number;
}
