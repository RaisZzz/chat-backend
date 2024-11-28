import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadMessagesDto {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsInt()
  readonly chatId: number;
}
