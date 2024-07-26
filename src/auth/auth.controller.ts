import {
  Post,
  Controller,
  Body,
  UseGuards,
  Req,
  Res,
  Head,
} from '@nestjs/common';
import { AuthResponse, AuthService, Tokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RealIP } from 'nestjs-real-ip';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

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
    @RealIP() ip: string,
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.auth(req.user, ip, response);
  }

  @Post('login')
  login(
    @RealIP() ip: string,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto, ip, response);
  }

  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(
    @Req() req,
    @RealIP() ip: string,
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto, ip, response, req.user);
  }

  @Post('updateToken')
  updateToken(@Req() req, @RealIP() ip: string): Promise<Tokens> {
    return this.authService.userUpdateToken(req, ip);
  }
}
