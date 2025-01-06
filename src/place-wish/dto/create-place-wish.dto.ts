import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { GetPlaceWishDto } from './get-plaсe-wish.dto';

export class CreatePlaceWishDto extends GetPlaceWishDto {
  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  @IsInt()
  @Min(0)
  @Max(1)
  readonly sex: number;

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
