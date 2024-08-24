import { IsInt } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class SetUserReactionReceivedDto extends BaseDto {
  @IsInt()
  readonly reactionId: number;
}
