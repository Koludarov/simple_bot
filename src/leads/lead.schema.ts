import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ILead } from './lead.interface';
import { Labels } from '../common/labels-types';
import { TelegramState } from '../common/telegram-states';
import { Geo } from '../utils/enums';

@Schema({ timestamps: true, collection: `leads`, versionKey: false })
export class Lead implements ILead {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop({ required: true, default: TelegramState.NO_ID })
  telegramState: TelegramState;

  @Prop({ required: true, default: Labels.MAIN })
  label: Labels;

  @Prop({ required: true, default: Geo.ru })
  geo: Geo;

  @Prop()
  username?: string;

  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = Lead & Document;

export const LeadSchema = SchemaFactory.createForClass(Lead);
