import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserByPhoneDto {
  @ApiProperty({ example: '+998000000000', description: 'Phone' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;
}
