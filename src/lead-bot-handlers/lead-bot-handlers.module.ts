import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { LeadHandlersService } from './lead-bot-handlers.service';
import { BotModule } from '../bot/bot.module';
import { FactsModule } from '../facts/facts.module';
import { ImagesModule } from '../images/images.module';
import { LeadsModule } from '../leads/leads.module';
import { PicturesModule } from '../pictures/pictures.module';

@Module({
  imports: [BotModule, FactsModule, LeadsModule, ImagesModule, PicturesModule, HttpModule],
  providers: [LeadHandlersService],
  exports: [LeadHandlersService],
})
export class LeadHandlersModule {}
