import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserReactionService } from './user-reaction.service';
import { UserReaction } from './user-reaction.model';
import { SendUserReactionDto } from './dto/send-user-reaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SmsGuard } from '../user/sms.guard';
import { SuccessInterface } from '../base/success.interface';
import { SetUserReactionReceivedDto } from './dto/set-received.dto';

@Controller('user-reaction')
export class UserReactionController {
  constructor(private userReactionService: UserReactionService) {}

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
}
