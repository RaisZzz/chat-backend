import { IsInt } from 'class-validator';

export class GetUserById {
  @IsInt()
  readonly userId: number;
}
