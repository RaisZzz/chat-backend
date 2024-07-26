import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParentsDto {
  @ApiProperty({ example: 'Высшее', description: 'Образование' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ example: 'Higher', description: 'Название на английском' })
  @IsString()
  @IsNotEmpty()
  readonly title_en: string;

  @ApiProperty({
    example: "Oliy ma'lumot",
    description: 'Название на узбекском',
  })
  @IsString()
  @IsNotEmpty()
  readonly title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кириллица)',
  })
  @IsString()
  @IsNotEmpty()
  readonly title_uz_cyr: string;
}
