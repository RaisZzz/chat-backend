import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserReactionService } from './user-reaction.service';
import { UserReaction } from './user-reaction.model';
import { SendUserReactionDto } from './dto/send-user-reaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SmsGuard } from '../user/sms.guard';
import { SuccessInterface } from '../base/success.interface';
import { SetUserReactionReceivedDto } from './dto/set-received.dto';
import { OffsetDto } from '../base/offset.dto';

@Controller('user-reaction')
export class UserReactionController {
  constructor(private userReactionService: UserReactionService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard)
  getAllUserChats(
    @Req() req,
    @Query() offsetDto: OffsetDto,
  ): Promise<UserReaction[]> {
    return this.userReactionService.getAllUserReactions(req.user, offsetDto);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, SmsGuard)
  send(
    @Req() req,
    @Body() sendDto: SendUserReactionDto,
  ): Promise<UserReaction> {
    return this.userReactionService.send(req.user, sendDto);
  }

  @Post('set-received')
  @UseGuards(JwtAuthGuard)
  setChatReceived(
    @Req() req,
    @Body() setDto: SetUserReactionReceivedDto,
  ): Promise<SuccessInterface> {
    return this.userReactionService.setUserReactionReceived(req.user, setDto);
  }

  @Post('send-unreceived')
  @UseGuards(JwtAuthGuard)
  sendUnreceived(@Req() req): Promise<SuccessInterface> {
    return this.userReactionService.sendAllUnreceivedReactions(req.user);
  }
}
