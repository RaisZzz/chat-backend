import { forwardRef, Module } from '@nestjs/common';
import { DocTextController } from './doc-text.controller';
import { DocTextService } from './doc-text.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocText } from './doc-text.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [DocTextController],
  providers: [DocTextService],
  imports: [
    SequelizeModule.forFeature([DocText]),
    forwardRef(() => AuthModule),
  ],
  exports: [DocTextService],
})
export class DocTextModule {}
