import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class LoginDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
