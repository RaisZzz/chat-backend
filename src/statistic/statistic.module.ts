import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserPurchase } from '../purchase/user-purchase.model';
import { Purchase } from '../purchase/purchase.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Purchase, UserPurchase]), AuthModule],
  providers: [StatisticService],
  controllers: [StatisticController],
})
export class StatisticModule {}
