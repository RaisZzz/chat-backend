import { IsBoolean, IsInt } from 'class-validator';

export class SetVerifiedStatusDto {
  @IsInt()
  readonly userId: number;

  @IsBoolean()
  readonly verified: boolean;
}
