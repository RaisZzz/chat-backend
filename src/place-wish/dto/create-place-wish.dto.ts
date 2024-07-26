import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetPlaEWishDto } from './get-plaсe-wish.dto';

export class CreatePlaceWishDto extends GetPlaEWishDto {
  @ApiProperty({
    example: 'Имеется своё жилье',
    description: 'Пожелание местожительства',
  })
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
    description: 'Название на Узбекистанском (кириллица)',
  })
  @IsString()
  @IsNotEmpty()
  readonly title_uz_cyr: string;
}
