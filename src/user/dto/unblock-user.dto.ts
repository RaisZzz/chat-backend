import { IsInt } from 'class-validator';

export class UnblockUserDto {
  @IsInt()
  readonly userId: number;
}
