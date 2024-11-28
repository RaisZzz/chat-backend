import { ApiProperty } from '@nestjs/swagger';

export class ConfirmShareChatDto {
  @ApiProperty({ example: 1, description: 'Link ID' })
  readonly linkId: number;
  @ApiProperty({ example: true, description: 'Is confirmed' })
  readonly confirmed: boolean;
}
