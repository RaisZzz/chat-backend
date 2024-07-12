import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendMessageDto {
  @IsUUID(4)
  uuid: string;

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
