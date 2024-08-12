import { IsInt } from 'class-validator';

export class ReadMessagesDto {
  @IsInt()
  readonly chatId: number;
}
