import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserById {
  @IsInt()
  @Type(() => Number)
  readonly userId: number;
}
