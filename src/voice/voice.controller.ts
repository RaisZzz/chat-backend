import { Controller, Get, Query, Res } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { GetVoiceDto } from './dto/get-voice.dto';

@Controller('voice')
export class VoiceController {
  constructor(private voiceService: VoiceService) {}

  @Get('/')
  // @UseGuards(JwtAuthGuard, SmsGuard)
  async getVoice(@Query() getVoiceDto: GetVoiceDto, @Res() res) {
    return this.voiceService.getFile(getVoiceDto, res);
  }
}
