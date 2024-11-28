import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SmsDto {
  @ApiProperty({ example: '1234', description: 'SMS code' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
