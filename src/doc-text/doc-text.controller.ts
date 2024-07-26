import { Controller, Get, UseGuards } from '@nestjs/common';
import { DocTextService } from './doc-text.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocText } from './doc-text.model';
import { TextInterface } from './doc.interface';
import { SmsGuard } from '../user/sms.guard';

@ApiTags('Текста')
@Controller('doc')
export class DocTextController {
  constructor(private docTextService: DocTextService) {}

  @ApiOperation({ summary: 'Получение текста политики конфиденциальности' })
  @ApiResponse({ status: 200, type: TextInterface })
  @Get('/privacy')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getPrivacyPolicy(): Promise<TextInterface> {
    return this.docTextService.getPrivacyPolicy();
  }

  @ApiOperation({ summary: 'Получение текста правил безопасности' })
  @ApiResponse({ status: 200, type: TextInterface })
  @Get('/rules')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getSafetyRules(): Promise<TextInterface> {
    return this.docTextService.getSafetyRules();
  }

  @ApiOperation({ summary: 'Получение текста публичной оферты' })
  @ApiResponse({ status: 200, type: TextInterface })
  @Get('/offer')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getPublicOffer(): Promise<TextInterface> {
    return this.docTextService.getPublicOffer();
  }

  @ApiOperation({ summary: 'Получение всех текстов' })
  @ApiResponse({ status: 200, type: DocText })
  @Get('/get_all')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getAll(): Promise<DocText> {
    return this.docTextService.getAll();
  }
}
