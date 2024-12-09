import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateParentsDto } from './dto/create-parents.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Parents } from './parents.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(Parents) private parentsRepository: typeof Parents,
  ) {}

  async createEducation(dto: CreateParentsDto): Promise<Parents> {
    return await this.parentsRepository.create(dto);
  }

  async getAll(): Promise<Parents[]> {
    return await this.parentsRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.parentsRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.parentsRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.parentsRepository.findOne({
      where: { id: editDto.id },
    });
    if (!item) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }
    await item.update({
      title: editDto.title,
      title_en: editDto.titleEn,
      title_uz: editDto.titleUz,
      title_uz_cyr: editDto.titleUzCyr,
    });

    return item;
  }
}
