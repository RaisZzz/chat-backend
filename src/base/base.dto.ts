import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform, Type, TransformOptions } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseDto {
  @ApiProperty({ example: 'ios', description: 'Platform' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['android', 'ios', 'admin'])
  @Trim()
  readonly platform: string;

  @ApiProperty({ example: 2, description: 'API version' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  readonly v: number;

  @ApiProperty({ example: 'iPhone 15.7', description: 'device' })
  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly device: string;

  @ApiProperty({ example: 'as34jdsfajhiou34', description: 'Unique device ID' })
  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly deviceId: string;
}

export function Trim(
  transformOptions?: TransformOptions,
): (target: any, key: string) => void {
  return Transform(({ value }: any) => value.trim(), transformOptions);
}
