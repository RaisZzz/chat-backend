import { OffsetDto } from '../../base/offset.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAdminUsersDto extends OffsetDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly searchQuery?: string;
}
