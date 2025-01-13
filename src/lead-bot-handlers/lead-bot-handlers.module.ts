import { Module } from '@nestjs/common';

import { LeadHandlersService } from './lead-bot-handlers.service';
import { LeadBotModule } from '../lead-bot/lead-bot.module';
// import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [LeadBotModule],
  providers: [LeadHandlersService],
  exports: [LeadHandlersService],
})
export class LeadHandlersModule {}
