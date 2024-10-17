import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { GetUsersDto } from './get-users.dto';

export class GetAdminUsersDto extends GetUsersDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly searchQuery?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  readonly withVerificationRequest?: boolean;
}
