import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Error, ErrorType } from 'src/error.class';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/user.model';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private jwtService: JwtService,
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
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
        secret: process.env.JWT_ACCESS_SECRET,
      };
      user = await this.jwtService.verifyAsync(token, accessOptions);
    } catch (e) {
      this.unauthorizedError();
    }

    request.user = await this.userRepository.findOne({
      where: { id: user?.id },
    });
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
