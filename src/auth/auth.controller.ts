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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Пинг сервера' })
  @ApiResponse({ status: 200 })
  @Head('ping')
  ping() {
    return true;
  }

  @ApiOperation({ summary: 'Авторизация' })
  @ApiResponse({ status: 200 })
  @Post('/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  auth(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
    @Body() baseDto: BaseDto,
  ): Promise<AuthResponse> {
    return this.authService.auth(req.user, baseDto.deviceId, response);
  }

  @ApiOperation({ summary: 'Получить данные для приложения' })
  @ApiResponse({ status: 200, type: AuthData })
  @Get('/data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getDataItems(): Promise<AuthData> {
    return this.authService.getDataItems();
  }

  @ApiOperation({ summary: 'Логин' })
  @ApiResponse({ status: 200, type: AuthResponse })
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto, response);
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 200, type: AuthResponse })
  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(
    @Req() req,
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto, response, req.user);
  }

  @ApiOperation({ summary: 'Переотправить СМС код' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('resent-sms-code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  resentSmsCode(@Req() req): Promise<SuccessInterface> {
    return this.authService.resentSmsCode(req.user);
  }

  @ApiOperation({ summary: 'Запрос на восстановление пароля' })
  @ApiResponse({ status: 200 })
  @Post('/recovery')
  recovery(@Body() recoveryDto: RecoveryDto) {
    return this.authService.recovery(recoveryDto);
  }

  @ApiOperation({ summary: 'Проверка СМС кода для восстановления пароля' })
  @ApiResponse({ status: 200, type: CheckRecoveryDto })
  @Post('/check_recovery_code')
  checkRecoveryCode(
    @Body() checkDto: CheckRecoveryDto,
  ): Promise<SuccessInterface> {
    return this.authService.checkRecoveryCode(checkDto);
  }

  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({ status: 200, type: AuthResponse })
  @Post('/change_recovery_password')
  changeRecoveryPassword(
    @Body() passwordDto: RecoveryPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.changeRecoveryPassword(passwordDto, response);
  }

  @ApiOperation({ summary: 'Обновить JWT токен' })
  @ApiResponse({ status: 200, type: Tokens })
  @Post('updateToken')
  updateToken(@Req() req, @Body() baseDto: BaseDto): Promise<Tokens> {
    return this.authService.userUpdateToken(req, baseDto.deviceId);
  }
}
