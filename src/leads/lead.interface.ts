import { TelegramState } from '../common/telegram-states';
import { Geo } from '../utils/enums';

export interface ILead {
  telegramId: number;
  state: TelegramState;
  isAdmin: boolean;
  geo: Geo;
  username?: string;
  firstname?: string;
  lastname?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
