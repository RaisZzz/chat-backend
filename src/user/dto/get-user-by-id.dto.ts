import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserById {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  @Type(() => Number)
  readonly userId: number;
}
