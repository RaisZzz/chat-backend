import { RecoveryDto } from './recovery.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckRecoveryDto extends RecoveryDto {
  @ApiProperty({ example: '1234', description: 'Смс-код (4 символа)' })
  @IsString()
  @Type(() => String)
  @MinLength(4)
  @MaxLength(4)
  readonly code: string;
}
