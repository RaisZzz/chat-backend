import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { LanguageService } from './language.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Language } from './language.model';
import { CreateLanguageDto } from './dto/create-language.dto';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@ApiTags('Языки')
@Controller('language')
export class LanguageController {
  constructor(private languageService: LanguageService) {}

  @ApiOperation({ summary: 'Создание интереса' })
  @ApiResponse({ status: 200, type: Language })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() languageDto: CreateLanguageDto) {
    return this.languageService.create(languageDto);
  }

  @ApiOperation({ summary: 'Получить все интересы' })
  @ApiResponse({ status: 200, type: [Language] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.languageService.getAll();
  }

  @ApiOperation({ summary: 'Удалить интерес' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.languageService.delete(deleteDto);
  }

  @ApiOperation({ summary: 'Изменить' })
  @Post('edit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  edit(@Body() editDto: EditDataItemDto) {
    return this.languageService.edit(editDto);
  }
}
