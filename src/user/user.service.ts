import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Error, ErrorType } from '../error.class';
import { InjectModel } from '@nestjs/sequelize';
import { OffsetDto } from '../base/offset.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async getUsers(offsetDto: OffsetDto): Promise<User[]> {
    return await this.userRepository.findAll({
      offset: offsetDto.offset,
      limit: 20,
    });
  }

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

  async checkUserExist(id: number): Promise<boolean> {
    const user: User = await this.userRepository.findOne({
      attributes: ['id'],
      where: { id },
    });
    return !!user;
  }
}
