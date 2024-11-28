import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnUserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  readonly userId: number;
}
