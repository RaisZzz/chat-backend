import { GetSharedChatDto } from './get-shared-chat.dto';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSharedChatMessagesDto extends GetSharedChatDto {
  @IsInt()
  @Type(() => Number)
  readonly offset: number;
}
