import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadNotificationDto {
  @ApiProperty({ example: 1, description: 'Notification ID' })
  @IsInt()
  id: number;
}
