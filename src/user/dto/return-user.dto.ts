import { IsInt } from 'class-validator';

export class ReturnUserDto {
  @IsInt()
  readonly userId: number;
}
