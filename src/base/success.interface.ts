import { ApiProperty } from '@nestjs/swagger';

export class SuccessInterface {
  @ApiProperty({ example: true, description: 'Success' })
  readonly success: boolean;
}
