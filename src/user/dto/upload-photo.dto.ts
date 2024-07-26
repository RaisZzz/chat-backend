import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadPhotoDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  readonly index?: number;
}
