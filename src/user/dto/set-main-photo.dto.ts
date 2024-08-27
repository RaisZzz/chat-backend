import { IsInt } from 'class-validator';

export class SetMainPhotoDto {
  @IsInt()
  readonly index: number;
}
