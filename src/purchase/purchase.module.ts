import { forwardRef, Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Purchase } from './purchase.model';
import { UserPurchase } from './user-purchase.model';
import { User } from 'src/user/user.model';
import { Message } from 'src/message/message.model';
import { Chat } from 'src/chat/chat.model';
import { WebsocketsModule } from '../websockets/websockets.module';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PurchaseService],
  controllers: [PurchaseController],
  imports: [
    SequelizeModule.forFeature([Purchase, UserPurchase, User, Message, Chat]),
    WebsocketsModule,
    forwardRef(() => AuthModule),
    HttpModule,
  ],
  exports: [PurchaseService],
})
export class PurchaseModule {}
