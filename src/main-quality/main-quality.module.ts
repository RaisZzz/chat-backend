import { forwardRef, Module } from '@nestjs/common';
import { MainQualityController } from './main-quality.controller';
import { MainQualityService } from './main-quality.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { MainQuality } from './main-quality.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [MainQualityController],
  providers: [MainQualityService],
  imports: [
    SequelizeModule.forFeature([MainQuality, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [MainQualityService],
})
export class MainQualityModule {}
