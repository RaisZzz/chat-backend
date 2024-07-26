import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Interest } from './interest.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class InterestService {
  constructor(
    @InjectModel(Interest) private interestRepository: typeof Interest,
  ) {}

  async create(dto: CreateInterestDto) {
    return await this.interestRepository.create(dto);
  }

  async getAll() {
    return await this.interestRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.interestRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.interestRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
