import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlaceWishDto } from './dto/create-place-wish.dto';
import { InjectModel } from '@nestjs/sequelize';
import { PlaceWish } from './place-wish.model';
import { User } from '../user/user.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class PlaceWishService {
  constructor(
    @InjectModel(PlaceWish)
    private placeWishRepository: typeof PlaceWish,
  ) {}

  async create(dto: CreatePlaceWishDto) {
    return await this.placeWishRepository.create(dto);
  }

  async getAll(user: User) {
    const isAdmin = user.roles.some((role) => ['admin'].includes(role.value));
    return await this.placeWishRepository.findAll(
      !isAdmin
        ? {
            where: { sex: user.sex },
          }
        : {},
    );
  }

  async getAllBySex(sex: number) {
    return await this.placeWishRepository.findAll({ where: { sex } });
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.placeWishRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.placeWishRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.placeWishRepository.findOne({
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
