import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CreateReligionDto } from './dto/create-religion.dto';
import { ReligionService } from './religion.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Religion } from './religion.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Религия')
@Controller('religion')
export class ReligionController {
  constructor(private religionService: ReligionService) {}

  @ApiOperation({ summary: 'Создание религии' })
  @ApiResponse({ status: 200, type: Religion })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() familyPositionDto: CreateReligionDto) {
    return this.religionService.create(familyPositionDto);
  }

  @ApiOperation({ summary: 'Получить все религии' })
  @ApiResponse({ status: 200, type: [Religion] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.religionService.getAll();
  }

  @ApiOperation({ summary: 'Удалить религию' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.religionService.delete(deleteDto);
  }
}
