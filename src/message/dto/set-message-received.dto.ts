import { IsUUID } from 'class-validator';

export class SetMessageReceivedDto {
  @IsUUID()
  readonly messageUuid: string;
}
