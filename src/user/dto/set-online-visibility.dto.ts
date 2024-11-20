import { IsBoolean } from 'class-validator';

export class SetOnlineVisibilityDto {
  @IsBoolean()
  readonly flag: boolean;
}
