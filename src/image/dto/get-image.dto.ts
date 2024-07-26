import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsInt } from "class-validator";

export class GetImageDto {
    @IsInt()
    @Type(() => Number)
    readonly id: number;

    @IsString()
    @IsOptional()
    readonly size: string;

    // @IsInt()
    // @IsOptional()
    // @Type(() => Number)
    // readonly width?: number;

    // @IsInt()
    // @IsOptional()
    // @Type(() => Number)
    // readonly height?: number;
}