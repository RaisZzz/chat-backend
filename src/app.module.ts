import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { UserRefresh } from './user/user-refresh.model';
import { ConfigModule } from '@nestjs/config';
import { Chat } from './chat/chat.model';
import { ChatUser } from './chat/chat-user.model';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'production'}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      hooks: {
        beforeUpdate(instance, options) {
          instance.dataValues.updatedAt = Math.floor(Date.now() / 1000);
        },
        beforeCreate(instance, options) {
          instance.dataValues.createdAt = Math.floor(Date.now() / 1000);
          instance.dataValues.updatedAt = Math.floor(Date.now() / 1000);
        },
      },
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: String(process.env.POSTGRES_USER),
      password: String(process.env.POSTGRES_PASSWORD),
      database: String(process.env.POSTGRES_DB),
      models: [User, UserRefresh, Chat, ChatUser],
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
  ],
})
export class AppModule {}
