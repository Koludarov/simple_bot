import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ILead } from './lead.interface';
import { Lead, LeadDocument } from './lead.schema';

export class LeadsProvider {
  constructor(@InjectModel(Lead.name) private leadsModel: Model<LeadDocument>) {}

  async getAllNonSmokers(): Promise<Lead[]> {
    return await this.leadsModel.find();
  }

  async create(telegramId: number, username?: string, firstname?: string, lastname?: string): Promise<ILead> {
    return await this.leadsModel.create({ telegramId, username, firstname, lastname });
  }

  async updateByTelegramId(telegramId: number, lead: Omit<ILead, 'telegramId'>): Promise<ILead> {
    return await this.leadsModel.findOneAndUpdate({ telegramId }, lead, { new: true });
  }

  async getByTelegramId(telegramId: number): Promise<ILead> {
    return await this.leadsModel.findOne({ telegramId });
  }

  async deleteByTelegramId(telegramId: number): Promise<ILead> {
    return await this.leadsModel.findOneAndDelete({ telegramId });
  }

  async updateTelegramStateByTelegramId(telegramId: number, state: string): Promise<ILead> {
    return await this.leadsModel.findOneAndUpdate({ telegramId }, { state }, { new: true });
  }
}
