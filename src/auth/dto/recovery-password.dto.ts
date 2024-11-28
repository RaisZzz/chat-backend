import { CheckRecoveryDto } from './check-recovery.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RecoveryPasswordDto extends CheckRecoveryDto {
  @ApiProperty({
    example: '12345678',
    description: 'Пароль (минимальная длина 8 символов)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}
