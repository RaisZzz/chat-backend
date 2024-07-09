import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SocketGateway } from '../websockets/socket.gateway';

@Processor('messageQueue')
export class MessageProcessor {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Process('sendMessage')
  async handleSendMessage(job: Job): Promise<void> {
    console.log('00');
    const message = job.data;
    console.log('01');
    this.socketGateway.sendMessage(1, message);
  }
}
