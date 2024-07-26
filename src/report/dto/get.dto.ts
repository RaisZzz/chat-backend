import { IsBoolean, IsOptional } from 'class-validator';
import { StatisticFilterDto } from '../../statistic/dto/statistic-filter.dto';
import { Transform, TransformFnParams } from 'class-transformer';

export class GetReportsDto extends StatisticFilterDto {
  @IsBoolean()
  @IsOptional()
  @Transform((value: TransformFnParams): boolean | null => {
    if (['true', true].includes(value.value)) {
      return true;
    } else if (['false', false].includes(value.value)) {
      return false;
    } else {
      return null;
    }
  })
  readonly showUnresolved: boolean;
}
