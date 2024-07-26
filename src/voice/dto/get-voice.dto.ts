import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVoiceDto {
  @IsInt()
  @Type(() => Number)
  readonly voiceId: number;
}
