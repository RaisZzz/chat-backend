import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto {
  from: number;
  to: number;
  type: NotificationType;
  title: string;
  body: string;
}
