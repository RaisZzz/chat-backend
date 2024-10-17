import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class BlockUserDto {
  @IsInt()
  readonly userId: number;

  @IsString()
  @IsNotEmpty()
  readonly blockReason: string;
}
