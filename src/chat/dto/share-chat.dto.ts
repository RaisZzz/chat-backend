import { IsIn, IsInt, IsPositive } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ShareChatDto extends BaseDto {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsInt()
  @IsPositive()
  readonly chatId: number;

  @ApiProperty({
    examples: [30, 60, 1440],
    description: 'Expire link time (in minutes)',
  })
  @IsInt()
  @IsIn([30, 60, 1440])
  readonly expireTime: number;
}
