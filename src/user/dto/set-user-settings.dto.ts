import { IsBoolean, IsOptional } from 'class-validator';
import { BaseDto } from '../../base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserSettingsDto extends BaseDto {
  @ApiProperty({
    example: true,
    description: 'Reactions notifications enabled',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly reactionsNotificationsEnabled: boolean | null;

  @ApiProperty({
    example: true,
    description: 'Messages notifications enabled',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly messagesNotificationsEnabled: boolean | null;

  @ApiProperty({
    example: true,
    description: 'Messages reactions notifications enabled',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly messagesReactionsNotificationsEnabled: boolean | null;
}
