import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { OrganisationType } from './organisation.model';
import { User } from '../user/user.model';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectModel(OrganisationType)
    private organisationRepository: typeof OrganisationType,
  ) {}

  async create(dto: CreateOrganisationDto) {
    return await this.organisationRepository.create(dto);
  }

  async getAll(user: User) {
    const isAdmin = user.roles.some((role) => ['admin'].includes(role.value));
    return await this.organisationRepository.findAll(
      !isAdmin
        ? {
            where: { sex: user.sex },
          }
        : {},
    );
  }

  async getAllBySex(sex: number) {
    return await this.organisationRepository.findAll({ where: { sex } });
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.organisationRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.organisationRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }

  async edit(editDto: EditDataItemDto) {
    const item = await this.organisationRepository.findOne({
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
