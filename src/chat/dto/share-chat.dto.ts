import { IsIn, IsInt, IsPositive } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class ShareChatDto extends BaseDto {
  @IsInt()
  @IsPositive()
  readonly chatId: number;

  @IsInt()
  @IsIn([30, 60, 1440])
  readonly expireTime: number;
}
