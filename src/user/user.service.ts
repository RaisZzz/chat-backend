import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Error, ErrorType } from '../error.class';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async getUser(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      throw new HttpException(
        new Error(ErrorType.UserNotFound),
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}
