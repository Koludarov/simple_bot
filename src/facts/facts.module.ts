import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FactsProvider } from './facts.provider';
import { Fact, FactSchema } from './facts.schema';
import { FactsService } from './facts.service';

@Module({
  exports: [FactsService],
  imports: [MongooseModule.forFeature([{ name: Fact.name, schema: FactSchema }])],
  providers: [FactsService, FactsProvider],
})
export class FactsModule {}
