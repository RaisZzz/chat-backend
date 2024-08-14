import { forwardRef, Module } from '@nestjs/common';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { OrganisationType } from './organisation.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OrganisationController],
  providers: [OrganisationService],
  imports: [
    SequelizeModule.forFeature([OrganisationType, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [OrganisationService],
})
export class OrganisationModule {}
