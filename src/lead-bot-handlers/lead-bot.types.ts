import { Labels } from '../common/labels-types';
import { TelegramState } from '../common/telegram-states';
import { ILead } from '../leads/lead.interface';

export type TLeadTelegramStates = {
  [key in TelegramState]: (text: string, lead: ILead) => Promise<void>;
};

export type TLeadLabels = {
  [key in Labels]: (lead: ILead) => Promise<void>;
};
