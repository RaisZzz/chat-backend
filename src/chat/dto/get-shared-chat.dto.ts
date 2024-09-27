import { IsUUID } from 'class-validator';

export class GetSharedChatDto {
  @IsUUID()
  readonly chatLinkUuid: string;
}
