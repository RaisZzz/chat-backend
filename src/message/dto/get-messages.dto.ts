import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { OffsetDto } from 'src/base/offset.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto extends OffsetDto {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsInt()
  @Type(() => Number)
  readonly chatId: number;
}
