import { forwardRef, Module } from '@nestjs/common';
import { WeddingWishController } from './wedding-wish.controller';
import { WeddingWishService } from './wedding-wish.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { WeddingWish } from './wedding-wish.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [WeddingWishController],
  providers: [WeddingWishService],
  imports: [
    SequelizeModule.forFeature([WeddingWish, User]),
    forwardRef(() => AuthModule),
  ],
  exports: [WeddingWishService],
})
export class WeddingWishModule {}
