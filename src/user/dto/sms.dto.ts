import { IsNotEmpty, IsString } from 'class-validator';

export class SmsDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
