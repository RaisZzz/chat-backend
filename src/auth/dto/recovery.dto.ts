import { MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../base/base.dto';

export class RecoveryDto extends BaseDto {
  @ApiProperty({ example: '+71234567890', description: 'Номер телефона' })
  @MinLength(12)
  @MaxLength(13)
  readonly phone: string;
}
