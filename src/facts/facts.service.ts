import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { IFact } from './facts.interface';
import { FactsProvider } from './facts.provider';

@Injectable()
export class FactsService {
  private readonly logger: LoggerService = new Logger(FactsService.name);
  constructor(private readonly factsProvider: FactsProvider) {}

  async getByDay(day: number): Promise<IFact> {
    this.logger.log(`Starting to get Fact by day: ${day}`);
    const fact = await this.factsProvider.getByDay(day);
    this.logger.log(`Ended working function get Fact by day: ${day}`);
    return fact;
  }
}
