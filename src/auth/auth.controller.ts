import {
  Post,
  Controller,
  Body,
  UseGuards,
  Req,
  Res,
  Head,
  Get,
} from '@nestjs/common';
import { AuthData, AuthResponse, AuthService, Tokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';
import { BaseDto } from '../base/base.dto';
import { RecoveryDto } from './dto/recovery.dto';
import { CheckRecoveryDto } from './dto/check-recovery.dto';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { SuccessInterface } from '../base/success.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Head('ping')
  ping() {
    return true;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  auth(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
    @Body() baseDto: BaseDto,
  ): Promise<AuthResponse> {
    return this.authService.auth(req.user, baseDto.deviceId, response);
  }

  @Get('/data')
  @UseGuards(JwtAuthGuard)
  getDataItems(): Promise<AuthData> {
    return this.authService.getDataItems();
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto, response);
  }

  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(
    @Req() req,
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto, response, req.user);
  }

  @Post('resent-sms-code')
  @UseGuards(JwtAuthGuard)
  resentSmsCode(@Req() req): Promise<SuccessInterface> {
    return this.authService.resentSmsCode(req.user);
  }

  @Post('/recovery')
  recovery(@Body() recoveryDto: RecoveryDto) {
    return this.authService.recovery(recoveryDto);
  }

  @Post('/check_recovery_code')
  checkRecoveryCode(
    @Body() checkDto: CheckRecoveryDto,
  ): Promise<SuccessInterface> {
    return this.authService.checkRecoveryCode(checkDto);
  }

  @Post('/change_recovery_password')
  changeRecoveryPassword(
    @Body() passwordDto: RecoveryPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.changeRecoveryPassword(passwordDto, response);
  }

  @Post('updateToken')
  updateToken(@Req() req, @Body() baseDto: BaseDto): Promise<Tokens> {
    return this.authService.userUpdateToken(req, baseDto.deviceId);
  }
}
