import { OffsetDto } from '../../base/offset.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAdminUsersDto extends OffsetDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly searchQuery?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  readonly withVerificationRequest?: boolean;
}
