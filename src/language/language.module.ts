import { forwardRef, Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Language } from './language.model';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.model';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService],
  imports: [
    SequelizeModule.forFeature([Language, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [LanguageService],
})
export class LanguageModule {}
