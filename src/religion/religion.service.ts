import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReligionDto } from './dto/create-religion.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Religion } from './religion.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class ReligionService {
  constructor(
    @InjectModel(Religion)
    private religionRepository: typeof Religion,
  ) {}

  async create(dto: CreateReligionDto) {
    return await this.religionRepository.create(dto);
  }

  async getAll() {
    return await this.religionRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.religionRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.religionRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
