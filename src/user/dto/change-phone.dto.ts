import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePhoneDto {
  @ApiProperty({ example: '+998000000000', description: 'New phone number' })
  @IsString()
  @IsNotEmpty()
  readonly newPhone: string;
}
