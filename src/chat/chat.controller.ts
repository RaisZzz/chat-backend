import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OffsetDto } from '../base/offset.dto';
import { GetChatDto } from './dto/get-chat.dto';
import { SuccessInterface } from '../base/success.interface';
import { SmsGuard } from '../user/sms.guard';
import { BaseDto } from '../base/base.dto';
import { ShareChatDto } from './dto/share-chat.dto';
import { ConfirmShareChatDto } from './dto/confirm-share-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getAllUserChats(@Req() req, @Query() offsetDto: OffsetDto): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(req.user, offsetDto);
  }

  @Get('get_support')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getUserSupportChat(@Req() req): Promise<Chat> {
    return this.chatService.getUserSupportChat(req.user);
  }

  @Post('share')
  @UseGuards(JwtAuthGuard, SmsGuard)
  shareChat(
    @Req() req,
    @Body() shareChatDto: ShareChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.shareChat(req.user, shareChatDto);
  }

  @Post('share_confirm')
  @UseGuards(JwtAuthGuard, SmsGuard)
  shareChatConfirm(
    @Req() req,
    @Body() shareConfirmDto: ConfirmShareChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.confirmShareChat(req.user, shareConfirmDto);
  }

  @Post('set-received')
  @UseGuards(JwtAuthGuard, SmsGuard)
  setChatReceived(
    @Req() req,
    @Body() setDto: GetChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.setChatReceived(req.user, setDto);
  }

  @Post('send-unreceived')
  @UseGuards(JwtAuthGuard, SmsGuard)
  sendUnreceived(
    @Req() req,
    @Body() baseDto: BaseDto,
  ): Promise<SuccessInterface> {
    return this.chatService.sendAllUnreceivedChats(req.user, baseDto);
  }
}
