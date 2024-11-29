import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateFamilyPositionDto } from './dto/create-family-position.dto';
import { FamilyPositionService } from './family-position.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FamilyPosition } from './family-position.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Семейное положение')
@Controller('family_position')
export class FamilyPositionController {
  constructor(private familyPositionService: FamilyPositionService) {}

  @ApiOperation({ summary: 'Создание семейного положения' })
  @ApiResponse({ status: 200, type: FamilyPosition })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() familyPositionDto: CreateFamilyPositionDto) {
    return this.familyPositionService.create(familyPositionDto);
  }

  @ApiOperation({ summary: 'Получить все виды семейного положения' })
  @ApiResponse({ status: 200, type: [FamilyPosition] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.familyPositionService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить семейное положение' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.familyPositionService.delete(deleteDto);
  }
}
