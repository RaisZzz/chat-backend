import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateParentsDto } from './dto/create-parents.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Parents } from './parents.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(Parents) private educationRepository: typeof Parents,
  ) {}

  async createEducation(dto: CreateParentsDto): Promise<Parents> {
    return await this.educationRepository.create(dto);
  }

  async getAll(): Promise<Parents[]> {
    return await this.educationRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.educationRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.educationRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
