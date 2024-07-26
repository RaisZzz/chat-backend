import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AnswerReportDto {
  @IsInt()
  readonly reportId: number;

  @IsString()
  @IsNotEmpty()
  readonly answer: string;
}
