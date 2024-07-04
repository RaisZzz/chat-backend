import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsInt()
  @IsOptional()
  toUserId?: number;

  @IsInt()
  @IsOptional()
  toChatId?: number;
}
