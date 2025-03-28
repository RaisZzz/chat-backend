import { IsInt } from 'class-validator';

export class DeletePurchaseDto {
  @IsInt()
  readonly purchaseId: number;
}
