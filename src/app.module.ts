import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { UserDevice } from './user/user-device.model';
import { ConfigModule } from '@nestjs/config';
import { Chat } from './chat/chat.model';
import { ChatUser } from './chat/chat-user.model';
import { BullModule } from '@nestjs/bull';
import { Image } from './image/image.model';
import { Education } from './education/education.model';
import { UserRoles } from './role/user-role.model';
import { Role } from './role/role.model';
import { UserImages } from './image/user-image.model';
import { Speciality } from './speciality/speciality.model';
import { OrganisationType } from './organisation-type/organisation.model';
import { FamilyPosition } from './family-position/family-position.model';
import { Religion } from './religion/religion.model';
import { Children } from './children/children.model';
import { UserSpeciality } from './speciality/user-speciality.model';
import { Interest } from './interest/interest.model';
import { UserInterest } from './interest/user-interest.model';
import { PlaceWish } from './place-wish/place-wish.model';
import { UserPlaceWish } from './place-wish/user-place-wish.model';
import { City } from './city/city.model';
import { Language } from './language/language.model';
import { UserLanguage } from './language/user-language.model';
import { Parents } from './parents/parents.model';
import { UserVerificationImages } from './image/user-verification-image.model';
import { Voice } from './voice/voice.model';
import { UserReactionModule } from './user-reaction/user-reaction.module';
import { UserReaction } from './user-reaction/user-reaction.model';
import { Report } from './report/report.model';
import { ReportModule } from './report/report.module';
import { UserReactionReceived } from './user-reaction/user-reaction-received.model';
import { VoiceModule } from './voice/voice.module';
import { UserModule } from './user/user.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ChatLink } from './chat/chat-link.model';
import { WeddingWish } from './wedding-wish/wedding-wish.model';
import { UserWeddingWish } from './wedding-wish/user-wedding-wish.model';
import { MainQuality } from './main-quality/main-quality.model';
import { UserMainQuality } from './main-quality/user-main-quality.model';
import { StatisticModule } from './statistic/statistic.module';
import { CityModule } from './city/city.module';
import { SpecialityModule } from './speciality/speciality.module';
import { EducationModule } from './education/education.module';
import { OrganisationModule } from './organisation-type/organisation.module';
import { FamilyPositionModule } from './family-position/family-position.module';
import { ParentsModule } from './parents/parents.module';
import { ReligionModule } from './religion/religion.module';
import { PlaceWishModule } from './place-wish/place-wish.module';
import { InterestModule } from './interest/interest.module';
import { LanguageModule } from './language/language.module';
import { ChildrenModule } from './children/children.module';
import { WeddingWishModule } from './wedding-wish/wedding-wish.module';
import { MainQualityModule } from './main-quality/main-quality.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'production'}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      logging: process.env.DB_LOGGING !== 'false',
      hooks: {
        beforeUpdate(instance, options) {
          instance.dataValues.updatedAt = Date.now();
        },
        beforeCreate(instance, options) {
          instance.dataValues.createdAt = Date.now();
          instance.dataValues.updatedAt = Date.now();
        },
      },
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: String(process.env.POSTGRES_USER),
      password: String(process.env.POSTGRES_PASSWORD),
      database: String(process.env.POSTGRES_DB),
      models: [
        User,
        UserDevice,
        Chat,
        ChatUser,
        Role,
        UserRoles,
        Image,
        Education,
        UserImages,
        Chat,
        Speciality,
        OrganisationType,
        FamilyPosition,
        Religion,
        Children,
        Voice,
        UserSpeciality,
        Interest,
        UserInterest,
        PlaceWish,
        UserPlaceWish,
        City,
        Language,
        UserLanguage,
        Parents,
        UserVerificationImages,
        UserReaction,
        Report,
        UserReactionReceived,
        ChatLink,
        WeddingWish,
        UserWeddingWish,
        MainQuality,
        UserMainQuality,
      ],
      autoLoadModels: true,
    }),
    MongooseModule.forRoot(String(process.env.MONGODB_URL)),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MessageModule,
    UserReactionModule,
    ReportModule,
    VoiceModule,
    UserModule,
    PurchaseModule,
    StatisticModule,
    CityModule,
    SpecialityModule,
    EducationModule,
    OrganisationModule,
    FamilyPositionModule,
    ParentsModule,
    ReligionModule,
    PlaceWishModule,
    InterestModule,
    LanguageModule,
    ChildrenModule,
    WeddingWishModule,
    MainQualityModule,
  ],
})
export class AppModule {}
