import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform, Type, TransformOptions } from 'class-transformer';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['android', 'ios'])
  @Trim()
  readonly platform: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  readonly v: number;

  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly device: string;
}

export function Trim(transformOptions?: TransformOptions): (target: any, key: string) => void {
  return Transform(({ value }: any) => value.trim(), transformOptions);
}