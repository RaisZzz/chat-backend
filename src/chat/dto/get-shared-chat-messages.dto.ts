import { GetSharedChatDto } from './get-shared-chat.dto';
import { IsInt, IsOptional } from 'class-validator';

export class GetSharedChatMessagesDto extends GetSharedChatDto {
  @IsInt()
  @IsOptional()
  readonly offset?: number;
}
