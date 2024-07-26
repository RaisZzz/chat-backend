import { LoginDto } from './login.dto';
import { IsIn, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsISO8601()
  readonly birthdate: string;

  @IsIn([0, 1])
  readonly sex: number;
}
