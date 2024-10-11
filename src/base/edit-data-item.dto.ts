import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditDataItemDto {
  @IsInt()
  readonly id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly titleEn?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly titleUz?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly titleUzCyr?: string;
}
