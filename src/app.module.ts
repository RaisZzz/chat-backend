import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { UserRefresh } from './user/user-refresh.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'production'}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: String(process.env.POSTGRES_USER),
      password: String(process.env.POSTGRES_PASSWORD),
      database: String(process.env.POSTGRES_DB),
      models: [User, UserRefresh],
      autoLoadModels: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/chat-test'),
    MessageModule,
  ],
})
export class AppModule {}
