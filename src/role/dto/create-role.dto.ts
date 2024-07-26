import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Значение роли' })
  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
