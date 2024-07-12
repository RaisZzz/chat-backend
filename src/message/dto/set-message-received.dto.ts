import { IsUUID } from 'class-validator';

export class SetMessageReceivedDto {
  @IsUUID(4, { each: true })
  readonly messagesUuid: string[];
}
