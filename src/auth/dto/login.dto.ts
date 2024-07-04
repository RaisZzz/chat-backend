import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    readonly login: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;
}