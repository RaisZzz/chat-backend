import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestService } from './interest.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Interest } from './interest.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { DeleteDto } from '../base/delete.dto';
import { EditDataItemDto } from '../base/edit-data-item.dto';

@ApiTags('Интересы')
@Controller('interests')
export class InterestController {
  constructor(private interestService: InterestService) {}

  @ApiOperation({ summary: 'Создание интереса' })
  @ApiResponse({ status: 200, type: Interest })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() interestDto: CreateInterestDto) {
    return this.interestService.create(interestDto);
  }

  @ApiOperation({ summary: 'Получить все интересы' })
  @ApiResponse({ status: 200, type: [Interest] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/get_all')
  getAll() {
    return this.interestService.getAll();
  }

  @ApiOperation({ summary: 'Удалить интерес' })
  @ApiResponse({ status: 200 })
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  delete(@Body() deleteDto: DeleteDto) {
    return this.interestService.delete(deleteDto);
  }

  @ApiOperation({ summary: 'Изменить' })
  @Post('edit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  edit(@Body() editDto: EditDataItemDto) {
    return this.interestService.edit(editDto);
  }
}
