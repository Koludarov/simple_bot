import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { ILead } from './lead.interface';
import { LeadsProvider } from './leads.provider';

@Injectable()
export class LeadsService {
  private readonly logger: LoggerService = new Logger(LeadsService.name);
  constructor(private readonly leadsProvider: LeadsProvider) {}

  async getAllNonSmokers(): Promise<ILead[]> {
    return await this.leadsProvider.getAllNonSmokers();
  }

  async create(telegramId: number, username?: string, firstname?: string, lastname?: string): Promise<ILead> {
    this.logger.log(`Starting working function create Lead: telegramId - ${telegramId}`);
    const lead = await this.leadsProvider.create(telegramId, username, firstname, lastname);
    this.logger.log(`Ended working function create Lead: telegramId - ${telegramId}`);
    return lead;
  }

  async updateByTelegramId(lead: ILead): Promise<ILead> {
    this.logger.log(`Starting working function updateByTelegramId Lead: ${JSON.stringify(lead)}`);
    const { telegramId, ...leadForUpdate } = lead;

    const updatedLead = await this.leadsProvider.updateByTelegramId(telegramId, leadForUpdate);
    this.logger.log(`Ended working function updateByTelegramId Lead: ${JSON.stringify(lead)}`);
    return updatedLead;
  }

  async updateTelegramStateByTelegramId(telegramId: number, state: string): Promise<ILead> {
    this.logger.log(`Starting working function updateByTelegramId Lead telegramId: ${telegramId}`);
    const updatedLead = await this.leadsProvider.updateTelegramStateByTelegramId(telegramId, state);
    this.logger.log(`Ended working function updateByTelegramId Lead telegramId: ${telegramId}`);
    return updatedLead;
  }

  async getByTelegramId(telegramId: number): Promise<ILead> {
    this.logger.log(`Starting to get Lead by telegramId: ${telegramId}`);
    const lead = await this.leadsProvider.getByTelegramId(telegramId);
    this.logger.log(`Ended working function get Lead by telegramId: ${telegramId}`);
    return lead;
  }
}
