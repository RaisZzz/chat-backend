import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  readonly userId: number;

  @ApiProperty({ example: 'Bad', description: 'Block reason' })
  @IsString()
  @IsNotEmpty()
  readonly blockReason: string;
}
