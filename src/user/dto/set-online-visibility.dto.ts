import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetOnlineVisibilityDto {
  @ApiProperty({ example: true, description: 'Online status visibility' })
  @IsBoolean()
  readonly flag: boolean;
}
