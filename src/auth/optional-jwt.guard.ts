import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/user.model';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const authHeader = req?.headers?.authorization;
    const token: string = authHeader?.split(' ')[1];

    let user;
    try {
      const accessOptions = {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
        secret: process.env.JWT_ACCESS_SECRET,
      };
      user = this.jwtService.verify(token, accessOptions);
      req.user = await this.userRepository.findOne({
        where: { id: user?.id },
      });
      req.token = token;
    } catch (e) {}

    return true;
  }
}
