import { IsInt } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserReactionReceivedDto extends BaseDto {
  @ApiProperty({ example: 1, description: 'User reaction ID' })
  @IsInt()
  readonly reactionId: number;
}
