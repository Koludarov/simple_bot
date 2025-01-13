import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { LeadBotProvider } from './lead-bot.provider';
import { LeadBotService } from './lead-bot.service';
// import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [HttpModule],
  providers: [LeadBotService, LeadBotProvider],
  exports: [LeadBotService],
})
export class LeadBotModule {}
