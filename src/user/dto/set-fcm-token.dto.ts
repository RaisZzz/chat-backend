import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class SetFCMTokenDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  readonly fcmToken: string;
}
