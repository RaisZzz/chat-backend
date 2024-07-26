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
import { SendMessageDto } from './dto/send-message.dto';
import { Message, SystemMessageType } from './message.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetMessageReceivedDto } from './dto/set-message-received.dto';
import { MessageService } from './message.service';
import { SuccessInterface } from '../base/success.interface';
import { GetMessagesDto } from './dto/get-messages.dto';
import { SetMessageLikeDto } from './dto/set-like.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard)
  getAll(@Req() req, @Query() getDto: GetMessagesDto): Promise<Message[]> {
    return this.messageService.getAll(req.user, getDto);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 10 },
        { name: 'voice', maxCount: 1 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  sendMessage(
    @Req() req,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles()
    files: { photos?: [Express.Multer.File]; voice?: [Express.Multer.File] },
  ): Promise<Message> {
    return this.messageService.sendMessage(
      req.user,
      sendMessageDto,
      SystemMessageType.Default,
      null,
      files?.photos,
      files?.voice,
    );
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  likeMessage(
    @Req() req,
    @Body() likeMessageDto: SetMessageLikeDto,
  ): Promise<SuccessInterface> {
    return this.messageService.setMessageLike(req.user, likeMessageDto);
  }

  @Post('set-received')
  @UseGuards(JwtAuthGuard)
  setMessageReceived(
    @Req() req,
    @Body() setMessageReceivedDto: SetMessageReceivedDto,
  ): Promise<SuccessInterface> {
    return this.messageService.setMessageReceived(
      req.user,
      setMessageReceivedDto,
    );
  }

  @Post('send-unreceived')
  @UseGuards(JwtAuthGuard)
  sendUnreceivedMessages(@Req() req): Promise<SuccessInterface> {
    return this.messageService.sendUnreceivedMessages(req.user.id);
  }
}
