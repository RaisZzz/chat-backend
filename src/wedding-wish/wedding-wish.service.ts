import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWeddingWishDto } from './dto/create-wedding-wish.dto';
import { InjectModel } from '@nestjs/sequelize';
import { WeddingWish } from './wedding-wish.model';
import { User } from 'src/user/user.model';
import { SuccessInterface } from '../base/success.interface';
import { DeleteDto } from '../base/delete.dto';
import { Error, ErrorType } from '../error.class';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class WeddingWishService {
  constructor(
    @InjectModel(WeddingWish)
    private weddingWishRespository: typeof WeddingWish,
  ) {}

  async createWeddingWish(dto: CreateWeddingWishDto): Promise<WeddingWish> {
    return await this.weddingWishRespository.create(dto);
  }

  async getAll(user: User): Promise<WeddingWish[]> {
    const isAdmin = user.roles.some((role) => ['admin'].includes(role.value));
    return await this.weddingWishRespository.findAll(
      !isAdmin
        ? {
            where: { sex: user.sex },
          }
        : {},
    );
  }

  async getAllBySex(sex: number): Promise<WeddingWish[]> {
    return await this.weddingWishRespository.findAll({ where: { sex } });
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.weddingWishRespository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.weddingWishRespository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.weddingWishRespository.findOne({
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
