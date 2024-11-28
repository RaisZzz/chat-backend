import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendUserReactionDto {
  @ApiProperty({ example: 1, description: 'To User ID' })
  @IsInt()
  readonly toUserId: number;

  @ApiProperty({ example: true, description: 'Is liked' })
  @IsBoolean()
  isLiked: boolean;

  @ApiProperty({ example: 'hello', description: 'Like message text' })
  @IsString()
  @IsOptional()
  superLikeMsg?: string;
}
