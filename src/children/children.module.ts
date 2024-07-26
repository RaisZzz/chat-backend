import { forwardRef, Module } from '@nestjs/common';
import { ChildrenController } from './children.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { Children } from './children.model';
import { ChildrenService } from './religion.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ChildrenController],
  providers: [ChildrenService],
  imports: [
    SequelizeModule.forFeature([Children, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [ChildrenService],
})
export class ChildrenModule {}
