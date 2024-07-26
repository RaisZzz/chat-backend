import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: '/uploads/1.png', description: 'Путь к изображению' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 350, description: 'Ширина изображения' })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ example: 150, description: 'Высота изображения' })
  @IsInt()
  @Min(1)
  height: number;

  @ApiProperty({ example: 2304, description: 'Размер изображения (в байтах)' })
  @IsInt()
  @Min(1)
  size: number;
}
