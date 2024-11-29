import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MainStat, StatisticService } from './statistic.service';
import { StatisticFilterDto } from './dto/statistic-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';

@ApiTags('Статистика')
@Controller('statistic')
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @ApiOperation({ summary: 'Транзакции (для админа)' })
  @Get('transactions')
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  transactions(@Query() filterDto: StatisticFilterDto) {
    return this.statisticService.getPurchases(filterDto);
  }

  @ApiOperation({
    summary: 'Статистика зарегистрированных пользователей (для админа)',
  })
  @Get('users')
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getUsersStat(@Query() filterDto: StatisticFilterDto) {
    return this.statisticService.usersStatistic(filterDto);
  }

  @ApiOperation({ summary: 'Статистика покупок (для админа)' })
  @Get('purchase')
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  get(@Query() filterDto: StatisticFilterDto) {
    return this.statisticService.purchaseStatistic(filterDto);
  }

  @ApiOperation({ summary: 'Общая статистика (для админа)' })
  @Get('main')
  @Roles('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMain(): Promise<MainStat> {
    return this.statisticService.getMainStatistic();
  }
}
