import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRefresh } from 'src/user/user-refresh.model';
import { UserModule } from 'src/user/user.module';
import { SmsModule } from '../sms/sms.module';
import { City } from '../city/city.model';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    SequelizeModule.forFeature([User, UserRefresh, City]),
    forwardRef(() => UserModule),
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
