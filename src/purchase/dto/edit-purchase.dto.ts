import { ApiProperty } from "@nestjs/swagger";
import { CreatePurchaseDto } from "./create-purchase.dto";
import { IsInt } from "class-validator";

export class EditPurchaseDto extends CreatePurchaseDto {
  @ApiProperty({ example: 1, description: 'id товара' })
  @IsInt()
  readonly id: number;
}