import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Error, ErrorType } from 'src/error.class';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers?.authorization;
    const bearer: string = authHeader?.split(' ')[0];
    const token: string = authHeader?.split(' ')[1];

    if (bearer !== 'Bearer' || !token) {
      this.unauthorizedError();
    }

    let user;
    try {
      const accessOptions = {
        expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRE) || 0,
        secret: process.env.JWT_ACCESS_SECRET,
      };
      user = await this.jwtService.verifyAsync(token, accessOptions);
    } catch (e) {
      this.unauthorizedError();
    }

    request.user = await this.userService.getUser(user?.sub);
    request.token = token;
    if (!request.user) {
      this.unauthorizedError();
    }
    return true;
  }

  unauthorizedError(): void {
    throw new HttpException(
      new Error(ErrorType.TokenInvalid),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
