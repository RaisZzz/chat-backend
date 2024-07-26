import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VoiceService } from './voice.service';
import { Voice } from './voice.model';
import { VoiceController } from './voice.controller';

@Module({
  providers: [VoiceService],
  controllers: [VoiceController],
  imports: [SequelizeModule.forFeature([Voice])],
  exports: [VoiceService],
})
export class VoiceModule {}
