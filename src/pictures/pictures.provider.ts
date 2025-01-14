import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPicture } from './pictures.interface';
import { Picture, PictureDocument } from './pictures.schema';

export class PicturesProvider {
  constructor(@InjectModel(Picture.name) private picturesModel: Model<PictureDocument>) {}

  async create(name: string, fileId: string): Promise<IPicture> {
    return await this.picturesModel.create({ name, fileId });
  }

  async deleteByName(name: string): Promise<IPicture> {
    return await this.picturesModel.findOneAndDelete({ name });
  }

  async updateByName(name: string, picture: IPicture): Promise<IPicture> {
    return await this.picturesModel.findOneAndUpdate({ name }, picture, { new: true });
  }

  async getRandomPicture(): Promise<IPicture> {
    const randomPic = await this.picturesModel.aggregate([{ $sample: { size: 1 } }]).exec();
    return randomPic[0];
  }
}
