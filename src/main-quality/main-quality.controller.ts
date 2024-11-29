import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateMainQualityDto } from './dto/create-main-quality.dto';
import { MainQualityService } from './main-quality.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MainQuality } from './main-quality.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Главное качество')
@Controller('main_quality')
export class MainQualityController {
  constructor(private mainQualityService: MainQualityService) {}

  @ApiOperation({ summary: 'Создание главного качества' })
  @ApiResponse({ status: 200, type: MainQuality })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() createMainQualityDto: CreateMainQualityDto) {
    return this.mainQualityService.createMainQuality(createMainQualityDto);
  }

  @ApiOperation({ summary: 'Получить все главные качества' })
  @ApiResponse({ status: 200, type: [MainQuality] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.mainQualityService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить главное качество' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.mainQualityService.delete(deleteDto);
  }
}
