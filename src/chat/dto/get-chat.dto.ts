import { IsInt } from 'class-validator';

export class GetChatDto {
  @IsInt()
  readonly chatId: number;
}
