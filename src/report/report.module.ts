import { forwardRef, Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Report } from './report.model';
import { User } from '../user/user.model';
import { Chat } from '../chat/chat.model';
import { HttpModule } from '@nestjs/axios';
import { Image } from '../image/image.model';
import { ChatModule } from '../chat/chat.module';
import { ImageModule } from '../image/image.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { AuthModule } from '../auth/auth.module';
import { UserReactionModule } from '../user-reaction/user-reaction.module';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports: [
    HttpModule,
    SequelizeModule.forFeature([Report, User, Chat, Image]),
    ChatModule,
    WebsocketsModule,
    ImageModule,
    forwardRef(() => AuthModule),
    UserReactionModule,
  ],
  exports: [ReportService],
})
export class ReportModule {}
