import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnblockUserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  readonly userId: number;
}
