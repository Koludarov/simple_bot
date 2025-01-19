import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { IFact } from './facts.interface';

@Schema({ timestamps: true, collection: `facts`, versionKey: false })
export class Fact implements IFact {
  _id: Types.ObjectId;

  @Prop()
  day: number;

  @Prop()
  message: string;

  @Prop()
  task: string;
}

export type FactDocument = Fact & Document;

export const FactSchema = SchemaFactory.createForClass(Fact);
