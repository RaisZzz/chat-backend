import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { SmsGuard } from './sms.guard';
import { NoSmsGuard } from './no-sms.guard';
import { SmsDto } from './dto/sms.dto';
import { SuccessInterface } from '../base/success.interface';
import { GetUserByPhoneDto } from './dto/get-user-by-phone.dto';
import { ApiOperation } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { SetFCMTokenDto } from './dto/set-fcm-token.dto';
import { RealIP } from 'nestjs-real-ip';
import { GetUserById } from './dto/get-user-by-id.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check')
  check(@Query() checkDto: GetUserByPhoneDto) {
    return this.userService.checkUserExist(checkDto);
  }

  @Get('get_all')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getAllUsers(@Req() req, @Query() getUsersDto: GetUsersDto): Promise<User[]> {
    return this.userService.getUsers(req.user, getUsersDto);
  }

  @Get('get_users_online')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getAnotherUsersOnline(@Req() req): Promise<Record<number, any>> {
    return this.userService.getAnotherUsersOnline(req.user);
  }

  @Post('update_info')
  @UseGuards(JwtAuthGuard, SmsGuard)
  updateInfo(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUserInfo(req.user, updateUserDto);
  }

  @Get('get-by-id')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getUserById(@Req() req, @Query() getUserByIdDto: GetUserById): Promise<User> {
    return this.userService.getUserById(req.user, getUserByIdDto);
  }

  @Post('set-fcm-token')
  @UseGuards(JwtAuthGuard)
  setFCMToken(
    @RealIP() ip: string,
    @Req() req,
    @Body() setFCMTokenDto: SetFCMTokenDto,
  ): Promise<SuccessInterface> {
    return this.userService.setFCMToken(ip, req.user, setFCMTokenDto);
  }

  @Post('check_sms_code')
  @UseGuards(JwtAuthGuard, NoSmsGuard)
  checkSmsCode(
    @Req() req,
    @Body() checkSmsDto: SmsDto,
  ): Promise<SuccessInterface> {
    return this.userService.checkSmsCode(req.user, checkSmsDto);
  }

  @ApiOperation({ summary: 'Загрузка фото' })
  @Post('upload_photo')
  @UseGuards(JwtAuthGuard, SmsGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photos', maxCount: 1 }], {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @Body() uploadPhotoDto: UploadPhotoDto,
    @UploadedFiles() files: { photos?: [Express.Multer.File] },
    @Req() req,
  ) {
    return this.userService.updatePhotosRequest(
      req.user,
      files?.photos,
      uploadPhotoDto,
    );
  }
}
