import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMainQualityDto } from './dto/create-main-quality.dto';
import { InjectModel } from '@nestjs/sequelize';
import { MainQuality } from './main-quality.model';
import { User } from 'src/user/user.model';
import { SuccessInterface } from '../base/success.interface';
import { DeleteDto } from '../base/delete.dto';
import { Error, ErrorType } from '../error.class';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class MainQualityService {
  constructor(
    @InjectModel(MainQuality)
    private mainQualityRepository: typeof MainQuality,
  ) {}

  async createMainQuality(dto: CreateMainQualityDto): Promise<MainQuality> {
    return await this.mainQualityRepository.create(dto);
  }

  async getAll(user: User): Promise<MainQuality[]> {
    const isAdmin = user.roles.some((role) => ['admin'].includes(role.value));
    return await this.mainQualityRepository.findAll(
      !isAdmin
        ? {
            where: { sex: user.sex },
          }
        : {},
    );
  }

  async getAllBySex(sex: number): Promise<MainQuality[]> {
    return await this.mainQualityRepository.findAll({ where: { sex } });
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.mainQualityRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.mainQualityRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.mainQualityRepository.findOne({
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
