import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IFact } from './facts.interface';
import { Fact, FactDocument } from './facts.schema';

export class FactsProvider {
  constructor(@InjectModel(Fact.name) private factsModel: Model<FactDocument>) {}

  async getByDay(day: number): Promise<IFact> {
    return await this.factsModel.findOne({ day });
  }
}
