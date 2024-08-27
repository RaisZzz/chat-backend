import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DeletePhotoDto {
  @IsInt()
  @Type(() => Number)
  readonly imageId: number;
}
