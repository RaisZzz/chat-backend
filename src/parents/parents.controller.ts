import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CreateParentsDto } from './dto/create-parents.dto';
import { ParentsService } from './parents.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Parents } from './parents.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@ApiTags('Родители')
@Controller('parents')
export class ParentsController {
  constructor(private parentService: ParentsService) {}

  @ApiOperation({ summary: 'Создание "родителей"' })
  @ApiResponse({ status: 200, type: Parents })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() educationDto: CreateParentsDto) {
    return this.parentService.createEducation(educationDto);
  }

  @ApiOperation({ summary: 'Получить все виды "родителей"' })
  @ApiResponse({ status: 200, type: [Parents] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.parentService.getAll();
  }

  @ApiOperation({ summary: 'Удалить "родителей"' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.parentService.delete(deleteDto);
  }

  @ApiOperation({ summary: 'Изменить' })
  @Post('edit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  edit(@Body() editDto: EditDataItemDto) {
    return this.parentService.edit(editDto);
  }
}
