import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Language } from './language.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateLanguageDto } from './dto/create-language.dto';
import { DeleteDto } from '../base/delete.dto';
import { SuccessInterface } from '../base/success.interface';
import { Error, ErrorType } from '../error.class';

@Injectable()
export class LanguageService {
  constructor(
    @InjectModel(Language) private languageRepository: typeof Language,
  ) {}

  async create(dto: CreateLanguageDto) {
    return await this.languageRepository.create(dto);
  }

  async getAll(): Promise<Language[]> {
    return await this.languageRepository.findAll();
  }

  async delete(deleteDto: DeleteDto): Promise<SuccessInterface> {
    const count = await this.languageRepository.count();
    if (count <= 1) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const response = await this.languageRepository.destroy({
      where: { id: deleteDto.id },
    });
    return { success: !!response };
  }
}
