import { Labels } from '../common/labels-types';
import { TelegramState } from '../common/telegram-states';
import { Geo } from '../utils/enums';

export interface ILead {
  telegramId: number;
  label: Labels;
  telegramState: TelegramState;
  geo: Geo;
  username?: string;
  firstname?: string;
  lastname?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
