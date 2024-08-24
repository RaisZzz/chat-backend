import { IsUUID } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class SetMessageReceivedDto extends BaseDto {
  @IsUUID(4, { each: true })
  readonly messagesUuid: string[];
}
