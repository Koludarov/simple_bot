import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { BotProvider } from './bot.provider';
import { BotService } from './bot.service';
// import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [HttpModule],
  providers: [BotService, BotProvider],
  exports: [BotService],
})
export class BotModule {}
