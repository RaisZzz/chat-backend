import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID(4)
  uuid: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsInt()
  toChatId: number;
}
