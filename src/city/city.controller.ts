import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CityService } from './city.service';

@Controller('city')
export class CityController {
  constructor(private cityService: CityService) {}

  @ApiOperation({ summary: 'Получить все города' })
  @Get('/get_all')
  @UseGuards(JwtAuthGuard)
  changeGeo() {
    return this.cityService.getAll();
  }
}
