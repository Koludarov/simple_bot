import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ILead } from './lead.interface';
import { TelegramState } from '../common/telegram-states';
import { Geo } from '../utils/enums';

@Schema({ timestamps: true, collection: `leads`, versionKey: false })
export class Lead implements ILead {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop({ required: true, default: Geo.ru })
  geo: Geo;

  @Prop({ required: true, default: TelegramState.MAIN })
  state: TelegramState;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop()
  username?: string;

  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  @Prop()
  smokingEndDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = Lead & Document;

export const LeadSchema = SchemaFactory.createForClass(Lead);
