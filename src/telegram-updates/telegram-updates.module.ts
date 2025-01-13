import { Module } from '@nestjs/common';

import { TelegramUpdatesController } from './telegram-updates.controller';
import { TelegramUpdatesService } from './telegram-updates.service';
import { LeadHandlersModule } from '../lead-bot-handlers/lead-bot-handlers.module';
// import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [LeadHandlersModule],
  controllers: [TelegramUpdatesController],
  providers: [TelegramUpdatesService],
})
export class TelegramUpdatesModule {}
