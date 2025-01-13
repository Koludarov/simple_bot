import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { flowMessages } from './lead-bot-handlers.constants';
import { LeadBotService } from '../lead-bot/lead-bot.service';
import { ILead } from '../leads/lead.interface';
// import { LeadsService } from '../leads/leads.service';
import { createButtonsArray } from '../utils/create-inline-keyboard';

@Injectable()
export class LeadHandlersService implements OnModuleInit {
  private readonly logger: LoggerService = new Logger(LeadHandlersService.name);
  // private readonly defaultTelegramId = this.configService.getOrThrow('DEFAULT_TG_ID');

  constructor(
    private readonly leadsBot: LeadBotService,
    // private readonly leadsService: LeadsService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {}

  async handleStart(telegramId: number, username?: string, firstname?: string, lastname?: string) {
    await this.leadsBot.sendMessageAndKeyboard(
      telegramId,
      `${flowMessages.greeting} ${username} ${firstname} ${lastname}`,
    );
  }

  async handleTextMessage(text: string, lead: ILead): Promise<void> {
    const { telegramState, label, telegramId } = lead;
    await this.leadsBot.sendMessageAndKeyboard(telegramId, 'Text');
  }

  async handleCallbackQuery(data: string, lead: ILead, messageId: number): Promise<void> {
    const { telegramId, telegramState } = lead;
    await this.leadsBot.deleteMessage(telegramId, messageId);
    await this.leadsBot.sendMessageAndKeyboard(telegramId, 'Callback');
  }
}
