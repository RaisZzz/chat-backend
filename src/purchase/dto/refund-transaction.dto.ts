import { IsInt } from 'class-validator';

export class RefundTransactionDto {
  @IsInt()
  readonly transactionId: number;
}
