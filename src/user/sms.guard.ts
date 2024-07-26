import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class SmsGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();

      if (!req.user.code_confirmed) this.unauthorizedError();

      return true;
    } catch (e) {
      this.unauthorizedError();
    }
  }

  unauthorizedError() {
    throw new HttpException(
      new Error(ErrorType.SmsNotConfirmed),
      HttpStatus.FORBIDDEN,
    );
  }
}
