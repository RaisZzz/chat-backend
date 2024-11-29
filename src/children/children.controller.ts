import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CreateChildrenDto } from './dto/create-children.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Children } from './children.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChildrenService } from './religion.service';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Дети')
@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @ApiOperation({ summary: 'Создание детей' })
  @ApiResponse({ status: 200, type: Children })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() familyPositionDto: CreateChildrenDto) {
    return this.childrenService.create(familyPositionDto);
  }

  @ApiOperation({ summary: 'Получить все детей' })
  @ApiResponse({ status: 200, type: [Children] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.childrenService.getAll();
  }

  @ApiOperation({ summary: 'Удалить детей' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.childrenService.delete(deleteDto);
  }
}
