import { IsDate, IsEnum, IsInt, Min } from 'class-validator';

import { TelegramState } from '../../common/telegram-states';
import { Geo } from '../../utils/enums';

export class LeadDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  telegramId: number;

  @IsEnum(TelegramState)
  state: TelegramState;

  @IsEnum(Geo)
  geo: Geo;

  @IsDate()
  smokingEndDate: Date;
}
