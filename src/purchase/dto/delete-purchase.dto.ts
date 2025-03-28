import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeletePurchaseDto {
  @ApiProperty({ example: 1, description: 'Purchase ID' })
  @IsInt()
  readonly purchaseId: number;
}
