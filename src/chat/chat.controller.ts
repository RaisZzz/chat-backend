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
import { GetSharedChatDto } from './dto/get-shared-chat.dto';
import { GetSharedChatMessagesDto } from './dto/get-shared-chat-messages.dto';
import { Message } from '../message/message.model';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { GetChatWithUserDto } from './dto/get-chat-with-user.dto';
import { UserBlockGuard } from '../user/user-block.guard';
import { UserDeletedGuard } from '../user/user-deleted.guard';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  getAllUserChats(@Req() req, @Query() offsetDto: OffsetDto): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(req.user, offsetDto);
  }

  @Get('get_support')
  @UseGuards(JwtAuthGuard, SmsGuard)
  getUserSupportChat(@Req() req): Promise<Chat> {
    return this.chatService.getUserSupportChat(req.user.id, req.user.id);
  }

  @Get('admin_get_chat_with_user')
  @UseGuards(JwtAuthGuard, SmsGuard, RolesGuard)
  @Roles('admin')
  adminGetChatWithUser(
    @Req() req,
    @Query() getDto: GetChatWithUserDto,
  ): Promise<Chat> {
    return this.chatService.getUserSupportChat(req.user.id, getDto.userId);
  }

  @Post('share')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  shareChat(
    @Req() req,
    @Body() shareChatDto: ShareChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.shareChat(req.user, shareChatDto);
  }

  @Post('share_confirm')
  @UseGuards(JwtAuthGuard, SmsGuard, UserBlockGuard, UserDeletedGuard)
  shareChatConfirm(
    @Req() req,
    @Body() shareConfirmDto: ConfirmShareChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.confirmShareChat(req.user, shareConfirmDto);
  }

  @Get('shared')
  getSharedChat(@Query() getSharedChatDto: GetSharedChatDto): Promise<Chat> {
    return this.chatService.getSharedChat(getSharedChatDto);
  }

  @Get('shared_messages')
  getSharedChatMessages(
    @Query() getSharedChatMessagesDto: GetSharedChatMessagesDto,
  ): Promise<Message[]> {
    return this.chatService.getSharedChatMessages(getSharedChatMessagesDto);
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
