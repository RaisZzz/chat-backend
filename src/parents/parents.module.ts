import { forwardRef, Module } from '@nestjs/common';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Parents } from './parents.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ParentsController],
  providers: [ParentsService],
  imports: [
    SequelizeModule.forFeature([User, Parents]),
    forwardRef(() => AuthModule),
  ],
  exports: [ParentsService],
})
export class ParentsModule {}
