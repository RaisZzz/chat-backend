import { forwardRef, Module } from '@nestjs/common';
import { ReligionController } from './religion.controller';
import { ReligionService } from './religion.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Religion } from './religion.model';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ReligionController],
  providers: [ReligionService],
  imports: [
    SequelizeModule.forFeature([Religion, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [ReligionService],
})
export class ReligionModule {}
