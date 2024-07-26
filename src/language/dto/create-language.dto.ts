import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLanguageDto {
  @ApiProperty({ example: 'Русский', description: 'Язык' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ example: 'Russian', description: 'Название на английском' })
  @IsString()
  @IsNotEmpty()
  readonly title_en: string;

  @ApiProperty({ example: 'Russian', description: 'Название на узбекском' })
  @IsString()
  @IsNotEmpty()
  readonly title_uz: string;

  @ApiProperty({
    example: 'russian',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @IsString()
  @IsNotEmpty()
  readonly title_uz_cyr: string;
}
