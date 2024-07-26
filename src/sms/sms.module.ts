import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
