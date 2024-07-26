import { IsBoolean, IsUUID } from 'class-validator';

export class SetMessageLikeDto {
  @IsUUID(4)
  messageUuid: string;

  @IsBoolean()
  readonly like: boolean;
}
