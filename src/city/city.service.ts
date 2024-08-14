import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { City } from './city.model';

@Injectable()
export class CityService {
  constructor(@InjectModel(City) private cityRepository: typeof City) {}

  async getAll(): Promise<City[]> {
    return await this.cityRepository.findAll({ order: [['id', 'ASC']] });
  }
}
