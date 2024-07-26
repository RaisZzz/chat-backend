import { forwardRef, Module } from '@nestjs/common';
import { InterestController } from './interest.controller';
import { InterestService } from './interest.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Interest } from './interest.model';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [InterestController],
  providers: [InterestService],
  imports: [
    SequelizeModule.forFeature([Interest, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [InterestService],
})
export class InterestModule {}
