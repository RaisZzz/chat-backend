import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  SendReactionResponse,
  UserReactionService,
} from './user-reaction.service';
import { UserReaction } from './user-reaction.model';
import { SendUserReactionDto } from './dto/send-user-reaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SmsGuard } from '../user/sms.guard';
import { SuccessInterface } from '../base/success.interface';
import { SetUserReactionReceivedDto } from './dto/set-received.dto';
import { OffsetDto } from '../base/offset.dto';
import { BaseDto } from '../base/base.dto';
import { UserBlockGuard } from '../user/user-block.guard';
import { UserDeletedGuard } from '../user/user-deleted.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Симпатии')
@Controller('user-reaction')
export class UserReactionController {
  constructor(private userReactionService: UserReactionService) {}

  @ApiOperation({ summary: 'Получить все симпатии' })
  @ApiResponse({ status: 200, type: [UserReaction] })
  @Get('get_all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getAllUserReactions(
    @Req() req,
    @Query() offsetDto: OffsetDto,
  ): Promise<UserReaction[]> {
    return this.userReactionService.getAllUserReactions(req.user, offsetDto);
  }

  @ApiOperation({ summary: 'Отправить симпатию' })
  @ApiResponse({ status: 200, type: SendReactionResponse })
  @Post('send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  send(
    @Req() req,
    @Body() sendDto: SendUserReactionDto,
  ): Promise<SendReactionResponse> {
    return this.userReactionService.send(req.user, sendDto);
  }

  @ApiOperation({ summary: 'Пометить симпатию доставленной' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set-received')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  setChatReceived(
    @Req() req,
    @Body() setDto: SetUserReactionReceivedDto,
  ): Promise<SuccessInterface> {
    return this.userReactionService.setUserReactionReceived(req.user, setDto);
  }

  @ApiOperation({ summary: 'Отправить недоставленные симпатия по сокетам' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('send-unreceived')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  sendUnreceived(
    @Req() req,
    @Body() baseDto: BaseDto,
  ): Promise<SuccessInterface> {
    return this.userReactionService.sendAllUnreceivedReactions(
      req.user,
      baseDto,
    );
  }
}
