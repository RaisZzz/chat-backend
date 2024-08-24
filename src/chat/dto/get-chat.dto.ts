import { IsInt } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class GetChatDto extends BaseDto {
  @IsInt()
  readonly chatId: number;
}
