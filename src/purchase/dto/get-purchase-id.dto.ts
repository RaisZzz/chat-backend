import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString } from 'class-validator';

export class GetPurchaseIdDto {
  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsInt()
  @Type(() => Number)
  purchaseId: number;

  @ApiProperty({ example: 'payme', description: 'Оператор' })
  @IsIn(['click', 'payme'])
  @IsString()
  operator: string;
}
