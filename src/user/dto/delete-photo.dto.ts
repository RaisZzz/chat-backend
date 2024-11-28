import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeletePhotoDto {
  @ApiProperty({ example: 1, description: 'Image ID' })
  @IsInt()
  @Type(() => Number)
  readonly imageId: number;
}
