import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Speciality } from './speciality.model';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';
import { DeleteDto } from '../base/delete.dto';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class SpecialityService {
  constructor(
    @InjectModel(Speciality) private specialityRepository: typeof Speciality,
  ) {}

  async create(dto: CreateSpecialityDto) {
    return await this.specialityRepository.create(dto);
  }

  async getAll() {
    return await this.specialityRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.specialityRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.specialityRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.specialityRepository.findOne({
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
