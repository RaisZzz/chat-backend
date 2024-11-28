import { IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SetResolvedDto {
  @ApiProperty({ example: 1, description: 'Report ID' })
  @IsInt()
  @Type(() => Number)
  readonly reportId: number;

  @ApiProperty({ example: true, description: 'Report is resolved' })
  @IsBoolean()
  @Type(() => Boolean)
  readonly resolved: boolean;
}
