import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateChildrenDto } from './dto/create-children.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Children } from './children.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Children)
    private childrenRepository: typeof Children,
  ) {}

  async create(dto: CreateChildrenDto) {
    return await this.childrenRepository.create(dto);
  }

  async getAll() {
    return await this.childrenRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.childrenRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.childrenRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
