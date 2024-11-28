import { MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../base/base.dto';

export class RecoveryDto extends BaseDto {
  @ApiProperty({ example: '+998000000000', description: 'Номер телефона' })
  @MinLength(12)
  @MaxLength(13)
  readonly phone: string;
}
