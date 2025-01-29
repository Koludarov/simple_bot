import { TelegramState } from '../common/telegram-states';
import { Geo } from '../utils/enums';

export interface DesireOfSmoke {
  [date: string]: number;
}

export interface ILead {
  telegramId: number;
  state: TelegramState;
  isAdmin: boolean;
  geo: Geo;
  username?: string;
  firstname?: string;
  lastname?: string;
  smokingEndDate?: Date;
  desireSmokingInc: DesireOfSmoke;
  moneySaved?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
