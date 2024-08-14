import { forwardRef, Module } from '@nestjs/common';
import { FamilyPositionController } from './family-position.controller';
import { FamilyPositionService } from './family-position.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { FamilyPosition } from './family-position.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [FamilyPositionController],
  providers: [FamilyPositionService],
  imports: [
    SequelizeModule.forFeature([FamilyPosition, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [FamilyPositionService],
})
export class FamilyPositionModule {}
