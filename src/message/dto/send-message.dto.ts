import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid', description: 'UUID' })
  @IsUUID(4)
  uuid: string;

  @ApiProperty({ example: 'hello', description: 'text', required: false })
  @IsString()
  @IsOptional()
  text: string;

  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsInt()
  @Type(() => Number)
  toChatId: number;
}
