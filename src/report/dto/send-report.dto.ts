import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendReportDto {
  @ApiProperty({ example: 1, description: 'ID на кого жалоба' })
  @IsInt()
  readonly reportedId: number;

  @ApiProperty({
    example: 'Мат',
    description: 'Текст жалобы (максимум 200 символов)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  readonly text: string;
}
