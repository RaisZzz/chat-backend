import { IsInt } from 'class-validator';

export class GetChatWithUserDto {
  @IsInt()
  userId: number;
}
