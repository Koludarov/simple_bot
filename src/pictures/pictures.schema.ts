import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { IPicture } from './pictures.interface';
@Schema({ timestamps: true, collection: `pictures`, versionKey: false })
export class Picture implements IPicture {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  fileId: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type PictureDocument = Picture & Document;

export const PictureSchema = SchemaFactory.createForClass(Picture);
