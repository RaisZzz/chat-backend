import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'silver', description: 'name товара' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Подписка VIP', description: 'Название товара' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Подписка VIP', description: 'Название товара (EN)' })
  @IsString()
  @IsNotEmpty()
  title_en: string;

  @ApiProperty({ example: 'Подписка VIP', description: 'Название товара (UZ)' })
  @IsString()
  @IsNotEmpty()
  title_uz: string;

  @ApiProperty({
    example: 'Подписка VIP',
    description: 'Название товара (UZ CYR)',
  })
  @IsString()
  @IsNotEmpty()
  title_uz_cyr: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (EN)',
  })
  @IsString()
  @IsNotEmpty()
  description_en: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (UZ)',
  })
  @IsString()
  @IsNotEmpty()
  description_uz: string;

  @ApiProperty({
    example: 'Подписка дает доступ к функциям',
    description: 'Описание товара (UZ CYR)',
  })
  @IsString()
  @IsNotEmpty()
  description_uz_cyr: string;

  @ApiProperty({ example: 300000, description: 'Стоимость (валюта - сум)' })
  @IsInt()
  price: number;

  @ApiProperty({ example: true, description: 'Подписка или нет' })
  @IsBoolean()
  isSubscribe: boolean;

  @ApiProperty({
    example: 5,
    description: 'Если подписка, то на сколько дней дается)',
  })
  @IsInt()
  @IsOptional()
  expireDays: number;

  @ApiProperty({ example: 10, description: 'Кол-во суперлайков' })
  @IsInt()
  superLikes: number;

  @ApiProperty({ example: 10, description: 'Кол-во возвратов' })
  @IsInt()
  returns: number;
}
