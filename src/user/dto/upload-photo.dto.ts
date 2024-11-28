import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPhotoDto {
  @ApiProperty({
    example: 1,
    description: 'User photo index (for change)',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  readonly index?: number;
}
