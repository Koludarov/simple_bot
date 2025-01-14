import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PicturesProvider } from './pictures.provider';
import { Picture, PictureSchema } from './pictures.schema';
import { PicturesService } from './pictures.service';

@Module({
  exports: [PicturesService],
  imports: [MongooseModule.forFeature([{ name: Picture.name, schema: PictureSchema }])],
  providers: [PicturesService, PicturesProvider],
})
export class PicturesModule {}
