import { IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetMessageLikeDto {
  @ApiProperty({ example: 'uuid', description: 'Message UUID' })
  @IsUUID(4)
  messageUuid: string;

  @ApiProperty({ example: true, description: 'Like status' })
  @IsBoolean()
  readonly like: boolean;
}
