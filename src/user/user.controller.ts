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
import {
  CheckUserExistResponse,
  UserInfoResponse,
  UserService,
} from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { SmsGuard } from './sms.guard';
import { NoSmsGuard } from './no-sms.guard';
import { SmsDto } from './dto/sms.dto';
import { SuccessInterface } from '../base/success.interface';
import { GetUserByPhoneDto } from './dto/get-user-by-phone.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { ChangePhoneDto } from './dto/change-phone.dto';

@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Проверить есть ли пользователь' })
  @ApiResponse({ status: 200, type: CheckUserExistResponse })
  @Get('check')
  check(@Query() checkDto: GetUserByPhoneDto): Promise<CheckUserExistResponse> {
    return this.userService.checkUserExist(checkDto);
  }

  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @Get('get_all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getAllUsers(@Req() req, @Query() getUsersDto: GetUsersDto): Promise<User[]> {
    return this.userService.getUsers(req.user, getUsersDto);
  }

  @ApiOperation({ summary: 'Получить всех пользователей (для админа)' })
  @ApiResponse({ status: 200, type: [User] })
  @Get('get_all_admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, RolesGuard)
  @Roles('admin')
  getAllUsersAdmin(
    @Req() req,
    @Query() getDto: GetAdminUsersDto,
  ): Promise<User[]> {
    return this.userService.getUsersForAdmin(req.user, getDto);
  }

  @ApiOperation({ summary: 'Вернуть последнего дизлайкнутого пользователя' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('return_last')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  returnLast(
    @Req() req,
    @Body() returnUserDto: ReturnUserDto,
  ): Promise<SuccessInterface> {
    return this.userService.returnUser(req.user, returnUserDto);
  }

  @ApiOperation({ summary: 'Получить пользователей в сети' })
  @ApiResponse({ status: 200 })
  @Get('get_users_online')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getAnotherUsersOnline(@Req() req): Promise<Record<number, any>> {
    return this.userService.getAnotherUsersOnline(req.user);
  }

  @ApiOperation({ summary: 'Редактировать информацию' })
  @ApiResponse({ status: 200, type: User })
  @Post('update_info')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  updateInfo(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUserInfo(req.user, updateUserDto);
  }

  @ApiOperation({ summary: 'Изменить настройки' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set-settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard)
  setSettings(
    @Req() req,
    @Body() setUserSettingsDto: SetUserSettingsDto,
  ): Promise<SuccessInterface> {
    return this.userService.setUserSettings(req.user, setUserSettingsDto);
  }

  @ApiOperation({ summary: 'Изменить геопозицию' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('geo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserBlockGuard, UserDeletedGuard)
  changeGeo(
    @Req() req,
    @Body() changeDto: ChangeGeoDto,
  ): Promise<SuccessInterface> {
    return this.userService.changeGeo(req.token, req.user, changeDto);
  }

  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, type: User })
  @Get('get-by-id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getUserById(@Req() req, @Query() getUserByIdDto: GetUserById): Promise<User> {
    return this.userService.getUserById(req.user, getUserByIdDto);
  }

  @ApiOperation({ summary: 'Получить информацию о пользователе' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Get('get-user-info')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard)
  getUserInfo(
    @Req() req,
    @Query() baseDto: BaseDto,
  ): Promise<UserInfoResponse> {
    return this.userService.getUserInfo(req.user, baseDto);
  }

  @ApiOperation({ summary: 'Отправить FCM токен' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set-fcm-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  setFCMToken(
    @Req() req,
    @Body() setFCMTokenDto: SetFCMTokenDto,
  ): Promise<SuccessInterface> {
    return this.userService.setFCMToken(req.user, setFCMTokenDto);
  }

  @ApiOperation({ summary: 'Удалить сессию устройства' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Delete('delete-device-session')
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Проверить СМС код' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('check_sms_code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, NoSmsGuard, UserBlockGuard, UserDeletedGuard)
  checkSmsCode(
    @Req() req,
    @Body() checkSmsDto: SmsDto,
  ): Promise<SuccessInterface> {
    return this.userService.checkSmsCode(req.user, checkSmsDto);
  }

  @ApiOperation({ summary: 'Загрузка фото' })
  @Post('upload_photo')
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Установить главное фото' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  @Post('set_main_photo')
  setMainPhoto(
    @Req() req,
    @Body() setMainPhotoDto: SetMainPhotoDto,
  ): Promise<Record<any, any>> {
    return this.userService.setMainPhoto(req.user, setMainPhotoDto);
  }

  @ApiOperation({ summary: 'Удалить фото' })
  @ApiResponse({ status: 200 })
  @Delete('delete_photo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  deletePhoto(
    @Body() deletePhotoDto: DeletePhotoDto,
    @Req() req,
  ): Promise<Record<any, any>> {
    return this.userService.deletePhoto(req.user, deletePhotoDto);
  }

  @ApiOperation({ summary: 'Отправка фото для верификации' })
  @Post('send_verification_photo')
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Установить статус верификации (для админа)' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set_verification_status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setUserVerificationStatus(
    @Req() req,
    @Body() setDto: SetVerifiedStatusDto,
  ): Promise<SuccessInterface> {
    return this.userService.setUserVerificationStatus(req.user, setDto);
  }

  @ApiOperation({ summary: 'Заблокировать пользователя (для админа)' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('block')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  blockUser(@Body() blockDto: BlockUserDto): Promise<SuccessInterface> {
    return this.userService.blockUser(blockDto);
  }

  @ApiOperation({ summary: 'Разблокировать пользователя' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('unblock')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  unblockUser(@Body() unblockDto: UnblockUserDto): Promise<SuccessInterface> {
    return this.userService.unblockUser(unblockDto);
  }

  @ApiOperation({ summary: 'Удалить аккаунт' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Delete('delete_account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Req() req): Promise<SuccessInterface> {
    return this.userService.deleteAccount(req.user);
  }

  @ApiOperation({ summary: 'Восстановить аккаунт' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('recovery_account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  recoveryAccount(@Req() req): Promise<SuccessInterface> {
    return this.userService.recoveryAccount(req.user);
  }

  @ApiOperation({ summary: 'Установить видимость статуса "В сети"' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set_online_visibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  setOnlineVisibility(
    @Req() req,
    @Body() setDto: SetOnlineVisibilityDto,
  ): Promise<SuccessInterface> {
    return this.userService.setOnlineVisibility(req.user, setDto);
  }

  @ApiOperation({ summary: 'Запросить СМС код для изменения телефона' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('change_phone_request_sms')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  requestChangePhoneSms(
    @Req() req,
    @Body() changeDto: ChangePhoneDto,
  ): Promise<SuccessInterface> {
    return this.userService.requestPhoneChangeSms(req.user, changeDto);
  }

  @ApiOperation({ summary: 'Изменить телефон' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('change_phone')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePhone(@Req() req, @Body() smsDto: SmsDto): Promise<SuccessInterface> {
    return this.userService.changePhone(req.user, smsDto);
  }
}
