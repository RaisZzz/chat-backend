import { IsBoolean, IsOptional } from 'class-validator';
import { BaseDto } from '../../base/base.dto';

export class SetUserSettingsDto extends BaseDto {
  @IsBoolean()
  @IsOptional()
  readonly reactionsNotificationsEnabled: boolean | null;

  @IsBoolean()
  @IsOptional()
  readonly messagesNotificationsEnabled: boolean | null;

  @IsBoolean()
  @IsOptional()
  readonly messagesReactionsNotificationsEnabled: boolean | null;
}
