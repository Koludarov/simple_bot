import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ImagesService } from './images.service';

@Module({
  imports: [HttpModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
