import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { OrganisationService } from './organisation.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganisationType } from './organisation.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Вид организации')
@Controller('organisation')
export class OrganisationController {
  constructor(private organisationService: OrganisationService) {}

  @ApiOperation({ summary: 'Создание вида организации' })
  @ApiResponse({ status: 200, type: OrganisationType })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() organisationDto: CreateOrganisationDto) {
    return this.organisationService.create(organisationDto);
  }

  @ApiOperation({ summary: 'Получить все виды организаций' })
  @ApiResponse({ status: 200, type: [OrganisationType] })
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.organisationService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить организацию' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.organisationService.delete(deleteDto);
  }
}
