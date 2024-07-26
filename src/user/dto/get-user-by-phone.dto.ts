import { IsNotEmpty, IsString } from "class-validator";

export class GetUserByPhoneDto {
    @IsString()
    @IsNotEmpty()
    readonly phone: string;
}