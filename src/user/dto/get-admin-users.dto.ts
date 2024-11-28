import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { GetUsersDto } from './get-users.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetAdminUsersDto extends GetUsersDto {
  @ApiProperty({ example: '', description: 'Search query', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly searchQuery?: string;

  @ApiProperty({
    example: true,
    description: 'With verification request photos',
    required: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  readonly withVerificationRequest?: boolean;

  @ApiProperty({
    example: true,
    description: 'Show blocked users',
    required: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  readonly showBlocked?: boolean;
}
