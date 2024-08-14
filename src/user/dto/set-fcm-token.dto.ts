import { IsNotEmpty, IsString } from 'class-validator';

export class SetFCMTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly fcmToken: string;
}
