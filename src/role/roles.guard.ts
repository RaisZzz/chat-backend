import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles-auth.decorator';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      const req = context.switchToHttp().getRequest();
      if (!requiredRoles) {
        return true;
      }

      if (!req.user.roles.some((role) => requiredRoles.includes(role.value)))
        this.unauthorizedError();

      return true;
    } catch (e) {
      this.unauthorizedError();
    }
  }

  unauthorizedError() {
    throw new HttpException(
      new Error(ErrorType.Forbidden),
      HttpStatus.FORBIDDEN,
    );
  }
}
