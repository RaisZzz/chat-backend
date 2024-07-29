import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @IsUUID(4)
  uuid: string;

  @IsString()
  @IsOptional()
  text: string;

  @IsInt()
  @Type(() => Number)
  toChatId: number;
}
