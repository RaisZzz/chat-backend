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
import { SmsGuard } from '../user/sms.guard';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { BaseDto } from '../base/base.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Сообщения')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @ApiOperation({ summary: 'Получить все сообщения' })
  @ApiResponse({ status: 200, type: [Message] })
  @Get('get_all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getAll(@Req() req, @Query() getDto: GetMessagesDto): Promise<Message[]> {
    return this.messageService.getAll(req.user, getDto);
  }

  @ApiOperation({ summary: 'Отправить сообщение' })
  @ApiResponse({ status: 200, type: Message })
  @Post('send')
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Лайкнуть сообщения' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  likeMessage(
    @Req() req,
    @Body() likeMessageDto: SetMessageLikeDto,
  ): Promise<SuccessInterface> {
    return this.messageService.setMessageLike(req.user, likeMessageDto);
  }

  @ApiOperation({ summary: 'Пометить сообщение доставленым' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('set-received')
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Пометить сообщение прочитаным' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('read-messages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SmsGuard)
  readMessages(
    @Req() req,
    @Body() readDto: ReadMessagesDto,
  ): Promise<SuccessInterface> {
    return this.messageService.readChatMessages(req.user, readDto);
  }

  @ApiOperation({ summary: 'Отправить недоставленные сообщения по сокетам' })
  @ApiResponse({ status: 200, type: SuccessInterface })
  @Post('send-unreceived')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  sendUnreceivedMessages(
    @Req() req,
    @Body() baseDto: BaseDto,
  ): Promise<SuccessInterface> {
    return this.messageService.sendUnreceivedMessages(
      req.user.id,
      baseDto.deviceId,
    );
  }
}
