import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { IPicture } from './pictures.interface';
import { PicturesProvider } from './pictures.provider';

@Injectable()
export class PicturesService {
  private readonly logger: LoggerService = new Logger(PicturesService.name);

  constructor(private readonly picturesProvider: PicturesProvider) {}

  async create(name: string, fileId: string): Promise<IPicture> {
    return await this.picturesProvider.create(name, fileId);
  }

  async deleteByName(name: string): Promise<IPicture> {
    return await this.picturesProvider.deleteByName(name);
  }

  async updateByName(name: string, picture: IPicture): Promise<IPicture> {
    return await this.picturesProvider.updateByName(name, picture);
  }

  async getRandomPicture(): Promise<IPicture> {
    return await this.picturesProvider.getRandomPicture();
  }
}
