import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CityService } from './city.service';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@ApiTags('Города')
@Controller('city')
export class CityController {
  constructor(private cityService: CityService) {}

  @ApiOperation({ summary: 'Получить все города' })
  @Get('/get_all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.cityService.getAll();
  }

  @ApiOperation({ summary: 'Изменить' })
  @Post('edit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  edit(@Body() editDto: EditDataItemDto) {
    return this.cityService.edit(editDto);
  }
}
