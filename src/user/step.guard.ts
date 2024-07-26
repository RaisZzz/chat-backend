import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { STEP_KEY } from './step.decorator';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class StepGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredStep = this.reflector.getAllAndOverride<string[]>(STEP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();

    if (
      req.user.step < requiredStep ||
      (req.user.step >= 5 && !req.user.code_confirmed)
    ) {
      this.stepError(req.user.step);
    }

    return true;
  }

  stepError(step: number) {
    throw new HttpException(
      new Error(ErrorType.StepError),
      HttpStatus.FORBIDDEN,
    );
  }
}
