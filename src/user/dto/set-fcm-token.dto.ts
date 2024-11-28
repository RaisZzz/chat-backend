import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SetFCMTokenDto extends BaseDto {
  @ApiProperty({ example: 'asd234asdfsdfa', description: 'FCM token' })
  @IsString()
  @IsNotEmpty()
  readonly fcmToken: string;
}
