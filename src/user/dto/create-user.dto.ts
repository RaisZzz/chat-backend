import { BaseDto } from '../../base/base.dto';

export class CreateUserDto extends BaseDto {
  readonly phone: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly birthdate: string;
  readonly sex: number;
  readonly password: string;
}
