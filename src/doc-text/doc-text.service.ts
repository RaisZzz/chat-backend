import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocText } from './doc-text.model';
import { TextInterface } from './doc.interface';

@Injectable()
export class DocTextService {
  constructor(
    @InjectModel(DocText) private docTextRepository: typeof DocText,
  ) {}

  async getPrivacyPolicy(): Promise<TextInterface> {
    const privacy = await this.docTextRepository.findOne({
      attributes: ['privacyPolicy', 'privacyPolicy_en', 'privacyPolicy_uz'],
    });
    return {
      ru: privacy?.privacyPolicy || '',
      en: privacy?.privacyPolicy_en || '',
      uz: privacy?.privacyPolicy_uz || '',
    };
  }

  async getPublicOffer(): Promise<TextInterface> {
    const publicOffer = await this.docTextRepository.findOne({
      attributes: ['publicOffer', 'publicOffer_en', 'publicOffer_uz'],
    });
    return {
      ru: publicOffer?.publicOffer || '',
      en: publicOffer?.publicOffer_en || '',
      uz: publicOffer?.publicOffer_uz || '',
    };
  }

  async getSafetyRules(): Promise<TextInterface> {
    const rules = await this.docTextRepository.findOne({
      attributes: ['safetyRules', 'safetyRules_en', 'safetyRules_uz'],
    });
    return {
      ru: rules?.safetyRules || '',
      en: rules?.safetyRules_en || '',
      uz: rules?.safetyRules_uz || '',
    };
  }

  async getAll(): Promise<DocText> {
    return await this.docTextRepository.findOne();
  }
}
