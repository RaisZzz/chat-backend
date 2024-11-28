import { GetSharedChatDto } from './get-shared-chat.dto';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetSharedChatMessagesDto extends GetSharedChatDto {
  @ApiProperty({ example: 0, description: 'Offset' })
  @IsInt()
  @Type(() => Number)
  readonly offset: number;
}
