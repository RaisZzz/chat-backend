import { IsInt } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetChatDto extends BaseDto {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsInt()
  readonly chatId: number;
}
