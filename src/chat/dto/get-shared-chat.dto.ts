import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSharedChatDto {
  @ApiProperty({ example: 'uuid', description: 'Chat link UUID' })
  @IsUUID()
  readonly chatLinkUuid: string;
}
