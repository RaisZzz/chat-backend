import { forwardRef, Module } from '@nestjs/common';
import { SpecialityController } from './speciality.controller';
import { SpecialityService } from './speciality.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Speciality } from './speciality.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SpecialityController],
  providers: [SpecialityService],
  imports: [
    SequelizeModule.forFeature([Speciality, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [SpecialityService],
})
export class SpecialityModule {}
