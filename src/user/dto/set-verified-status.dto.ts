import { IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetVerifiedStatusDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  readonly userId: number;

  @ApiProperty({ example: true, description: 'Is verified' })
  @IsBoolean()
  readonly verified: boolean;
}
