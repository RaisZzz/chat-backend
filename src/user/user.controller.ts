import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
import { Step } from './step.decorator';
import { StepGuard } from './step.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadPhotoDto } from './dto/upload-photo.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/check')
  check(@Query() checkDto: GetUserByPhoneDto) {
    return this.userService.checkUserExist(checkDto);
  }

  @Get('get_all')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getAllUsers(@Req() req, @Query() getUsersDto: GetUsersDto): Promise<User[]> {
    return this.userService.getUsers(req.user, getUsersDto);
  }

  @Post('update_info')
  @UseGuards(JwtAuthGuard, SmsGuard)
  updateInfo(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUserInfo(req.user, updateUserDto);
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
  @Put('/upload_photo')
  @Step(2)
  @UseGuards(JwtAuthGuard, StepGuard, SmsGuard)
  @UseInterceptors(
    FilesInterceptor('photos', 1, {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @Body() uploadPhotoDto: UploadPhotoDto,
    @UploadedFiles() photos: [Express.Multer.File],
    @Req() req,
  ) {
    return this.userService.updatePhotosRequest(
      req.user,
      photos,
      uploadPhotoDto,
    );
  }
}
