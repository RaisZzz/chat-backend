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
export class UserDeletedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.user.deletedAt) {
      this.deletedError(req.user.deletedAt);
    }

    return true;
  }

  deletedError(deletedAt): void {
    throw new HttpException(
      new Error(ErrorType.UserBlocked, { deletedAt }),
      HttpStatus.FORBIDDEN,
    );
  }
}
