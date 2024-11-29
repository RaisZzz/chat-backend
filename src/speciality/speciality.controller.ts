import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { SpecialityService } from './speciality.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Speciality } from './speciality.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Специальность')
@Controller('speciality')
export class SpecialityController {
  constructor(private specialityService: SpecialityService) {}

  @ApiOperation({ summary: 'Создание специальности' })
  @ApiResponse({ status: 200, type: Speciality })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() specialityDto: CreateSpecialityDto) {
    return this.specialityService.create(specialityDto);
  }

  @ApiOperation({ summary: 'Получить все специальности' })
  @ApiResponse({ status: 200, type: [Speciality] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.specialityService.getAll();
  }

  @ApiOperation({ summary: 'Удалить специальность' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.specialityService.delete(deleteDto);
  }
}
