import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserInfoResponse, UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { SmsGuard } from './sms.guard';
import { NoSmsGuard } from './no-sms.guard';
import { SmsDto } from './dto/sms.dto';
import { SuccessInterface } from '../base/success.interface';
import { GetUserByPhoneDto } from './dto/get-user-by-phone.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { SetFCMTokenDto } from './dto/set-fcm-token.dto';
import { GetUserById } from './dto/get-user-by-id.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { BaseDto } from '../base/base.dto';
import { DeleteDeviceSessionDto } from './dto/delete-device-session.dto';
import { SetUserSettingsDto } from './dto/set-user-settings.dto';
import { ChangeGeoDto } from './dto/change-geo.dto';
import { Image } from '../image/image.model';
import { DeletePhotoDto } from './dto/delete-photo.dto';
import { SetMainPhotoDto } from './dto/set-main-photo.dto';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { GetAdminUsersDto } from './dto/get-admin-users.dto';
import { SetVerifiedStatusDto } from './dto/set-verified-status.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { UnblockUserDto } from './dto/unblock-user.dto';
import { UserBlockGuard } from './user-block.guard';
import { UserDeletedGuard } from './user-deleted.guard';
import { SetOnlineVisibilityDto } from './dto/set-online-visibility.dto';

@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check')
  check(@Query() checkDto: GetUserByPhoneDto) {
    return this.userService.checkUserExist(checkDto);
  }

  @Get('get_all')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getAllUsers(@Req() req, @Query() getUsersDto: GetUsersDto): Promise<User[]> {
    return this.userService.getUsers(req.user, getUsersDto);
  }

  @Get('get_all_admin')
  @UseGuards(JwtAuthGuard, SmsGuard, RolesGuard)
  @Roles('admin')
  getAllUsersAdmin(
    @Req() req,
    @Query() getDto: GetAdminUsersDto,
  ): Promise<User[]> {
    return this.userService.getUsersForAdmin(req.user, getDto);
  }

  @Post('return_last')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  returnLast(
    @Req() req,
    @Body() returnUserDto: ReturnUserDto,
  ): Promise<SuccessInterface> {
    return this.userService.returnUser(req.user, returnUserDto);
  }

  @Get('get_users_online')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getAnotherUsersOnline(@Req() req): Promise<Record<number, any>> {
    return this.userService.getAnotherUsersOnline(req.user);
  }

  @Post('update_info')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  updateInfo(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUserInfo(req.user, updateUserDto);
  }

  @Post('set-settings')
  @UseGuards(JwtAuthGuard, SmsGuard)
  setSettings(
    @Req() req,
    @Body() setUserSettingsDto: SetUserSettingsDto,
  ): Promise<SuccessInterface> {
    return this.userService.setUserSettings(req.user, setUserSettingsDto);
  }

  @Post('geo')
  @UseGuards(JwtAuthGuard, UserBlockGuard, UserDeletedGuard)
  changeGeo(@Req() req, @Body() changeDto: ChangeGeoDto) {
    return this.userService.changeGeo(req.token, req.user, changeDto);
  }

  @Get('get-by-id')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getUserById(@Req() req, @Query() getUserByIdDto: GetUserById): Promise<User> {
    return this.userService.getUserById(req.user, getUserByIdDto);
  }

  @Get('get-user-info')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getUserInfo(
    @Req() req,
    @Query() baseDto: BaseDto,
  ): Promise<UserInfoResponse> {
    return this.userService.getUserInfo(req.user, baseDto);
  }

  @Post('set-fcm-token')
  @UseGuards(JwtAuthGuard)
  setFCMToken(
    @Req() req,
    @Body() setFCMTokenDto: SetFCMTokenDto,
  ): Promise<SuccessInterface> {
    return this.userService.setFCMToken(req.user, setFCMTokenDto);
  }

  @Delete('delete-device-session')
  @UseGuards(JwtAuthGuard)
  disableFCMToken(
    @Req() req,
    @Body() deleteDeviceSessionDto: DeleteDeviceSessionDto,
  ): Promise<SuccessInterface> {
    return this.userService.deleteUserDeviceSession(
      req.user,
      deleteDeviceSessionDto,
    );
  }

  @Post('check_sms_code')
  @UseGuards(JwtAuthGuard, NoSmsGuard, UserBlockGuard, UserDeletedGuard)
  checkSmsCode(
    @Req() req,
    @Body() checkSmsDto: SmsDto,
  ): Promise<SuccessInterface> {
    return this.userService.checkSmsCode(req.user, checkSmsDto);
  }

  @ApiOperation({ summary: 'Загрузка фото' })
  @Post('upload_photo')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
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

  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  @Post('set_main_photo')
  setMainPhoto(
    @Req() req,
    @Body() setMainPhotoDto: SetMainPhotoDto,
  ): Promise<Record<any, any>> {
    return this.userService.setMainPhoto(req.user, setMainPhotoDto);
  }

  @Delete('delete_photo')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  deletePhoto(
    @Body() deletePhotoDto: DeletePhotoDto,
    @Req() req,
  ): Promise<Record<any, any>> {
    return this.userService.deletePhoto(req.user, deletePhotoDto);
  }

  @ApiOperation({ summary: 'Отправка фото для верификации' })
  @Post('send_verification_photo')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photos', maxCount: 1 }], {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  sendVerificationPhoto(
    @Req() req,
    @UploadedFiles() files: { photos?: [Express.Multer.File] },
  ): Promise<Image> {
    return this.userService.sendVerificationPhotos(req.user, files.photos[0]);
  }

  @Post('set_verification_status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setUserVerificationStatus(
    @Req() req,
    @Body() setDto: SetVerifiedStatusDto,
  ): Promise<SuccessInterface> {
    return this.userService.setUserVerificationStatus(req.user, setDto);
  }

  @Post('block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  blockUser(@Body() blockDto: BlockUserDto): Promise<SuccessInterface> {
    return this.userService.blockUser(blockDto);
  }

  @Post('unblock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  unblockUser(@Body() unblockDto: UnblockUserDto): Promise<SuccessInterface> {
    return this.userService.unblockUser(unblockDto);
  }

  @Delete('delete_account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Req() req): Promise<SuccessInterface> {
    return this.userService.deleteAccount(req.user);
  }

  @Post('recovery_account')
  @UseGuards(JwtAuthGuard)
  recoveryAccount(@Req() req): Promise<SuccessInterface> {
    return this.userService.recoveryAccount(req.user);
  }

  @Post('set_online_visibility')
  @UseGuards(JwtAuthGuard)
  setOnlineVisibility(
    @Req() req,
    @Body() setDto: SetOnlineVisibilityDto,
  ): Promise<SuccessInterface> {
    return this.userService.setOnlineVisibility(req.user, setDto);
  }
}
