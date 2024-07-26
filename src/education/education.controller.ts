import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { EducationService } from './education.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Education } from './education.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Образование')
@Controller('education')
export class EducationController {
  constructor(private educationService: EducationService) {}

  @ApiOperation({ summary: 'Создание образования' })
  @ApiResponse({ status: 200, type: Education })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() educationDto: CreateEducationDto) {
    return this.educationService.createEducation(educationDto);
  }

  @ApiOperation({ summary: 'Получить все виды образования' })
  @ApiResponse({ status: 200, type: [Education] })
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.educationService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить образование' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.educationService.delete(deleteDto);
  }
}
