import { forwardRef, Module } from '@nestjs/common';
import { PlaceWishController } from './place-wish.controller';
import { PlaceWishService } from './place-wish.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { PlaceWish } from './place-wish.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PlaceWishController],
  providers: [PlaceWishService],
  imports: [
    SequelizeModule.forFeature([PlaceWish, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [PlaceWishService],
})
export class PlaceWishModule {}
