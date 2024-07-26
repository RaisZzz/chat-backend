import { ApiProperty } from '@nestjs/swagger';

export class GetFamilyPositionDto {
  @ApiProperty({ example: 0, description: 'Пол (0 - женский, 1 - мужской)' })
  readonly sex: number;
}
