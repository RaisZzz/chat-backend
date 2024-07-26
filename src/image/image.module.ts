import { forwardRef, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AuthModule } from '../auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Image } from './image.model';
import { UserModule } from '../user/user.module';

@Module({
  providers: [ImageService],
  controllers: [ImageController],
  imports: [
    SequelizeModule.forFeature([Image]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  exports: [ImageService],
})
export class ImageModule {}
