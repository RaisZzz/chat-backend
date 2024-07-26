import {
  Body,
  Controller,
  Delete,
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

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard)
  getAllUserChats(@Req() req, @Query() offsetDto: OffsetDto): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(req.user, offsetDto);
  }

  @Post('set-received')
  @UseGuards(JwtAuthGuard)
  setChatReceived(
    @Req() req,
    @Body() setDto: GetChatDto,
  ): Promise<SuccessInterface> {
    return this.chatService.setChatReceived(req.user, setDto);
  }

  @Post('send-unreceived')
  @UseGuards(JwtAuthGuard)
  sendUnreceived(@Req() req): Promise<SuccessInterface> {
    return this.chatService.sendAllUnreceivedChats(req.user);
  }
}
