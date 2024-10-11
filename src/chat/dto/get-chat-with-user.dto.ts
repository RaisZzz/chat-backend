import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetChatWithUserDto {
  @IsInt()
  @Type(() => Number)
  userId: number;
}
