import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AuthModule } from '../auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Image } from './image.model';

@Module({
  providers: [ImageService],
  controllers: [ImageController],
  imports: [SequelizeModule.forFeature([Image]), AuthModule],
  exports: [ImageService],
})
export class ImageModule {}
