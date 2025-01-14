import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { CallbackQuery, Message, Update } from 'node-telegram-bot-api';

import { LeadHandlersService } from '../lead-bot-handlers/lead-bot-handlers.service';
import { ILead } from '../leads/lead.interface';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class TelegramUpdatesService {
  private readonly logger: LoggerService = new Logger(TelegramUpdatesService.name);

  constructor(
    private readonly leadHandlersService: LeadHandlersService,
    private readonly leadsService: LeadsService,
  ) {}

  async handleLeadBotUpdate({ message, callback_query }: Update): Promise<void> {
    const { from } = message || callback_query;
    const { id: telegramId, username, first_name, last_name } = from;
    const lead = await this.leadsService.getByTelegramId(telegramId);
    console.log(lead);
    if (message && !lead) {
      await this.leadHandlersService.handleStart(telegramId, username, first_name, last_name);
      return;
    }

    if (message) {
      return await this.handleLeadMessage(message, lead);
    }
    return await this.handleLeadCallBack(callback_query, lead);
  }

  async handleLeadMessage(message: Message, lead: ILead) {
    const { text } = message;
    this.logger.log(`Update message: ${JSON.stringify(message)}`);
    await this.leadHandlersService.handleTextMessage(text, lead);
  }

  async handleLeadCallBack(callbackQuery: CallbackQuery, lead: ILead) {
    const { data, message } = callbackQuery;
    const { message_id: messageId } = message;
    this.logger.log(`Update callback_query: ${JSON.stringify(callbackQuery)}`);
    await this.leadHandlersService.handleCallbackQuery(data, lead, messageId);
  }
}
