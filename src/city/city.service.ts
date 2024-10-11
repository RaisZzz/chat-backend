import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { City } from './city.model';
import { EditDataItemDto } from '../base/edit-data-item.dto';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class CityService {
  constructor(@InjectModel(City) private cityRepository: typeof City) {}

  async getAll(): Promise<City[]> {
    return await this.cityRepository.findAll({ order: [['id', 'ASC']] });
  }

  async edit(editDto: EditDataItemDto): Promise<City> {
    const item = await this.cityRepository.findOne({
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
