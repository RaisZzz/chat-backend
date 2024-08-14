import { forwardRef, Module } from '@nestjs/common';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Education } from './education.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [EducationController],
  providers: [EducationService],
  imports: [
    SequelizeModule.forFeature([Education, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [EducationService],
})
export class EducationModule {}
