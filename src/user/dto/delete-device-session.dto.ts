import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeviceSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly deviceId: string;
}
