import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserDevice } from 'src/user/user-device.model';
import { SmsModule } from '../sms/sms.module';
import { City } from '../city/city.model';
import { Education } from '../education/education.model';
import { Speciality } from '../speciality/speciality.model';
import { OrganisationType } from '../organisation-type/organisation.model';
import { FamilyPosition } from '../family-position/family-position.model';
import { Parents } from '../parents/parents.model';
import { Religion } from '../religion/religion.model';
import { PlaceWish } from '../place-wish/place-wish.model';
import { Interest } from '../interest/interest.model';
import { Language } from '../language/language.model';
import { Children } from '../children/children.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageModel } from '../message/message.model';
import { WebsocketsModule } from '../websockets/websockets.module';
import { Role } from '../role/role.model';
import { UserRoles } from '../role/user-role.model';
import { ChatUser } from '../chat/chat-user.model';
import { WeddingWish } from '../wedding-wish/wedding-wish.model';
import { MainQuality } from '../main-quality/main-quality.model';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: messageModel,
      },
    ]),
    SequelizeModule.forFeature([
      User,
      UserDevice,
      City,
      Education,
      Speciality,
      OrganisationType,
      FamilyPosition,
      Parents,
      Religion,
      PlaceWish,
      Interest,
      Language,
      Children,
      Role,
      UserRoles,
      ChatUser,
      WeddingWish,
      MainQuality,
    ]),
    SmsModule,
    WebsocketsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
