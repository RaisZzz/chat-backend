import { SendReportDto } from './send-report.dto';
import { IsInt } from 'class-validator';

export class CreateReportDto extends SendReportDto {
  @IsInt()
  readonly ownerId: number;
}
