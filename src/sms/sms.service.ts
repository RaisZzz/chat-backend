import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import process from 'process';
import { HttpService } from '@nestjs/axios';

export enum SmsType {
  auth,
  changePhone,
}

const smsLabel: Record<SmsType, Record<string, string>> = {
  0: {
    ru: 'Ваш код авторизации',
    en: 'Your authorization code',
  },
  1: {
    ru: 'Код для смены номера',
    en: 'Code for phone change',
  },
};

@Injectable()
export class SmsService {
  constructor(private readonly httpService: HttpService) {}

  async sendSmsCode(
    phone: string,
    type: SmsType,
    code: string,
    lang: string,
  ): Promise<boolean> {
    // TODO: REMOVE TEST
    return 'Request is received' === 'Request is received';

    const labels: Record<string, string> = smsLabel[type];
    const langLabel: string = labels[lang] ? labels[lang] : labels['en'];
    const text = `${langLabel}: ${code}`;

    const response = await firstValueFrom(
      this.httpService.post(
        process.env.SMS_API_URL,
        {
          messages: [
            {
              recipient: phone.replace(/\D/g, ''),
              'message-id': '15',
              sms: {
                originator: '3700',
                priority: 'realtime',
                content: {
                  text,
                },
              },
            },
          ],
        },
        {
          auth: {
            username: process.env.SMS_API_LOGIN,
            password: process.env.SMS_API_PASSWORD,
          },
        },
      ),
    );
    return response.data;
  }
}
