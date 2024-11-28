import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto extends BaseDto {
  @ApiProperty({ example: '+998000000000', description: 'Phone' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({ example: '12345678', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
