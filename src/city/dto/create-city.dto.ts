import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({ example: 'lorem', description: 'Название на Русском' })
  title: string;

  @ApiProperty({ example: 'lorem', description: 'Название на Английском' })
  title_en: string;

  @ApiProperty({ example: 'lorem', description: 'Название на Узбекистанском' })
  title_uz: string;

  @ApiProperty({
    example: 'lorem',
    description: 'Название на Узбекистанском (кирилица)',
  })
  title_uz_cyr: string;

  @ApiProperty({
    example: 1,
    description: 'Приоритет в списке',
  })
  priority: number;
}
