import { forwardRef, Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { City } from './city.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CityController],
  providers: [CityService],
  imports: [SequelizeModule.forFeature([City]), forwardRef(() => AuthModule)],
  exports: [CityService],
})
export class CityModule {}
