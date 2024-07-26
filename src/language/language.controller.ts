import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Language } from './language.model';
import { CreateLanguageDto } from './dto/create-language.dto';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@Controller('language')
export class LanguageController {
  constructor(private languageService: LanguageService) {}

  @ApiOperation({ summary: 'Создание интереса' })
  @ApiResponse({ status: 200, type: Language })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() languageDto: CreateLanguageDto) {
    return this.languageService.create(languageDto);
  }

  @ApiOperation({ summary: 'Получить все интересы' })
  @ApiResponse({ status: 200, type: [Language] })
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.languageService.getAll();
  }

  @ApiOperation({ summary: 'Удалить интерес' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.languageService.delete(deleteDto);
  }
}
