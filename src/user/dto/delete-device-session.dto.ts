import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteDeviceSessionDto {
  @ApiProperty({ example: 'asfdasjfh123', description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  readonly deviceId: string;
}
