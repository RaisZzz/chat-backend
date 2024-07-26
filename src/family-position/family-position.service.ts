import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFamilyPositionDto } from './dto/create-family-position.dto';
import { InjectModel } from '@nestjs/sequelize';
import { FamilyPosition } from './family-position.model';
import { User } from '../user/user.model';
import { Error, ErrorType } from '../error.class';
import { SuccessInterface } from '../base/success.interface';
import { DeleteDto } from '../base/delete.dto';

@Injectable()
export class FamilyPositionService {
  constructor(
    @InjectModel(FamilyPosition)
    private familyPositionRepository: typeof FamilyPosition,
  ) {}

  async create(dto: CreateFamilyPositionDto) {
    return await this.familyPositionRepository.create(dto);
  }

  async getAll(user: User) {
    const isAdmin = user.roles.some((role) => ['admin'].includes(role.value));
    return await this.familyPositionRepository.findAll(
      !isAdmin
        ? {
            where: { sex: user.sex },
          }
        : {},
    );
  }

  async getAllBySex(sex: number) {
    return await this.familyPositionRepository.findAll({ where: { sex } });
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.familyPositionRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.familyPositionRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
