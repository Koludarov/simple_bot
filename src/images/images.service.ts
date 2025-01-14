import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ImagesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTelegramImageBuffer(imagePath: string): Promise<Buffer> {
    const botToken = this.configService.getOrThrow<string>('LEADS_BOT_TOKEN');
    const imageUrl = `https://api.telegram.org/file/bot${botToken}/${imagePath}`;
    const { data } = await firstValueFrom(
      this.httpService.get(imageUrl, {
        responseType: 'arraybuffer',
      }),
    );
    return Buffer.from(data);
  }
}
