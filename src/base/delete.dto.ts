import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteDto {
  @ApiProperty({ example: 1, description: 'ID' })
  @IsInt()
  @IsNotEmpty()
  readonly id: number;
}
