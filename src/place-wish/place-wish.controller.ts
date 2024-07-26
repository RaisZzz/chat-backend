import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePlaceWishDto } from './dto/create-place-wish.dto';
import { PlaceWishService } from './place-wish.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlaceWish } from './place-wish.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Пожелание местожительства')
@Controller('place_wish')
export class PlaceWishController {
  constructor(private placeWishService: PlaceWishService) {}

  @ApiOperation({ summary: 'Создание пожелания местожительства' })
  @ApiResponse({ status: 200, type: PlaceWish })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() placeWishDto: CreatePlaceWishDto) {
    return this.placeWishService.create(placeWishDto);
  }

  @ApiOperation({ summary: 'Получить все пожелания местожительства' })
  @ApiResponse({ status: 200, type: [PlaceWish] })
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.placeWishService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить пожелание местожительства' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.placeWishService.delete(deleteDto);
  }
}
