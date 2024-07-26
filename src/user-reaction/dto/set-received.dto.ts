import { IsInt } from 'class-validator';

export class SetUserReactionReceivedDto {
  @IsInt()
  readonly reactionId: number;
}
