import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class SendUserReactionDto {
  @IsInt()
  readonly toUserId: number;

  @IsBoolean()
  isLiked: boolean;

  @IsString()
  @IsOptional()
  superLikeMsg?: string;
}
