import { IsUUID } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SetMessageReceivedDto extends BaseDto {
  @ApiProperty({ example: 'uuid', description: 'Message UUID' })
  @IsUUID(4, { each: true })
  readonly messagesUuid: string[];
}
