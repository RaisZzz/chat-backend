import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class UserBlockGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.user.blockedAt) {
      this.blockError(req.user.blockedAt);
    }

    return true;
  }

  blockError(blockedAt): void {
    throw new HttpException(
      new Error(ErrorType.UserBlocked),
      HttpStatus.FORBIDDEN,
    );
  }
}
