import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MainStat, StatisticService } from './statistic.service';
import { StatisticFilterDto } from './dto/statistic-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';

@Controller('statistic')
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @ApiOperation({ summary: 'Транзакции (для админа)' })
  @Get('transactions')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  transactions(@Query() filterDto: StatisticFilterDto) {
    return this.statisticService.getPurchases(filterDto);
  }

  @ApiOperation({ summary: 'Статистика покупок (для админа)' })
  @Get('purchase')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  get(@Query() filterDto: StatisticFilterDto) {
    return this.statisticService.purchaseStatistic(filterDto);
  }

  @ApiOperation({ summary: 'Общая статистика (для админа)' })
  @Get('main')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMain(): Promise<MainStat> {
    return this.statisticService.getMainStatistic();
  }
}
