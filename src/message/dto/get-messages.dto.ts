import { Type } from "class-transformer";
import { IsInt } from "class-validator";
import { OffsetDto } from "src/base/offset.dto";

export class GetMessagesDto extends OffsetDto {
    @IsInt()
    @Type(() => Number)
    readonly chatId: number;
}