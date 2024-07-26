import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocDto {
  @ApiProperty({ example: 'Lorem ipsum...', description: 'Публичная оферта' })
  @IsString()
  @IsNotEmpty()
  publicOffer: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Политика конфиденциальности',
  })
  @IsString()
  @IsNotEmpty()
  privacyPolicy: string;

  @ApiProperty({
    example: 'Lorem ipsum...',
    description: 'Правила безопасности',
  })
  @IsString()
  @IsNotEmpty()
  safetyRules: string;
}
