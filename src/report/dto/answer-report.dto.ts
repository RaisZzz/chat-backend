import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerReportDto {
  @ApiProperty({ example: 1, description: 'Report iD' })
  @IsInt()
  readonly reportId: number;

  @ApiProperty({ example: 'Problem passed', description: 'Answer on report' })
  @IsString()
  @IsNotEmpty()
  readonly answer: string;
}
