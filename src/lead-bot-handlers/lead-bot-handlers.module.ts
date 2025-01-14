import { Module } from '@nestjs/common';

import { LeadHandlersService } from './lead-bot-handlers.service';
import { BotModule } from '../bot/bot.module';
import { ImagesModule } from '../images/images.module';
import { LeadsModule } from '../leads/leads.module';
import { PicturesModule } from '../pictures/pictures.module';

@Module({
  imports: [BotModule, LeadsModule, ImagesModule, PicturesModule],
  providers: [LeadHandlersService],
  exports: [LeadHandlersService],
})
export class LeadHandlersModule {}
