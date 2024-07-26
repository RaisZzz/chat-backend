import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChildrenDto {
  @ApiProperty({ example: 'Есть', description: 'Дети' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ example: 'Divorced', description: 'Название на английском' })
  @IsString()
  @IsNotEmpty()
  readonly title_en: string;

  @ApiProperty({ example: 'Ajrashgan', description: 'Название на узбекском' })
  @IsString()
  @IsNotEmpty()
  readonly title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекском (кириллица)',
  })
  @IsString()
  @IsNotEmpty()
  readonly title_uz_cyr: string;
}
