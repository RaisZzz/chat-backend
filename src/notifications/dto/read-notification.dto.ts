import { IsInt } from 'class-validator';

export class ReadNotificationDto {
  @IsInt()
  id: number;
}
