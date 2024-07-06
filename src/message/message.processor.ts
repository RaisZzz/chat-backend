import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SocketGateway } from '../websockets/socket.gateway';

@Processor('messageQueue')
export class MessageProcessor {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Process('sendMessage')
  async handleSendMessage(job: Job) {
    const message = job.data;
    this.socketGateway.sendMessage(1, message);
  }
}
