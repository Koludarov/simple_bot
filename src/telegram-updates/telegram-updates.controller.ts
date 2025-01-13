import { Body, Controller, Post } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

import { TelegramUpdatesService } from './telegram-updates.service';

@Controller('telegram-updates')
export class TelegramUpdatesController {
  constructor(private readonly updatesService: TelegramUpdatesService) {}

  @Post('/leads')
  async handleLeadUpdate(@Body() update: TelegramBot.Update) {
    return this.updatesService.handleLeadBotUpdate(update);
  }
}
