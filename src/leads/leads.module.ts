import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Lead, LeadSchema } from './lead.schema';
import { LeadsProvider } from './leads.provider';
import { LeadsService } from './leads.service';

@Module({
  exports: [LeadsService],
  imports: [MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }])],
  providers: [LeadsService, LeadsProvider],
})
export class LeadsModule {}
