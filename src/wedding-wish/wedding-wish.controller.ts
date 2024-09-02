import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateWeddingWishDto } from './dto/create-wedding-wish.dto';
import { WeddingWishService } from './wedding-wish.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeddingWish } from './wedding-wish.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';

@ApiTags('Пожелания после свадьбы')
@Controller('wedding_wish')
export class WeddingWishController {
  constructor(private weddingWishService: WeddingWishService) {}

  @ApiOperation({ summary: 'Создание пожелания после свадьбы' })
  @ApiResponse({ status: 200, type: WeddingWish })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() createWeddingWishDto: CreateWeddingWishDto) {
    return this.weddingWishService.createWeddingWish(createWeddingWishDto);
  }

  @ApiOperation({ summary: 'Получить все пожелания после свадьбы' })
  @ApiResponse({ status: 200, type: [WeddingWish] })
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll(@Req() req) {
    return this.weddingWishService.getAll(req.user);
  }

  @ApiOperation({ summary: 'Удалить пожелания после свадьбы' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.weddingWishService.delete(deleteDto);
  }
}
