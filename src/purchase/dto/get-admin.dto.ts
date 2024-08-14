import { IsOptional, IsString } from 'class-validator';

export class GetPurchaseAdminDto {
  @IsString()
  @IsOptional()
  readonly search: string;
}
