import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InlineKeyboardMarkup, Message, PhotoSize } from 'node-telegram-bot-api';

import { flowMessages } from './lead-bot-handlers.constants';
import { BotService } from '../bot/bot.service';
import { TelegramState } from '../common/telegram-states';
import { ImagesService } from '../images/images.service';
import { ILead } from '../leads/lead.interface';
import { LeadsService } from '../leads/leads.service';
import { PicturesService } from '../pictures/pictures.service';
import { createButtonsArray } from '../utils/create-inline-keyboard';
import { Geo } from '../utils/enums';

@Injectable()
export class LeadHandlersService implements OnModuleInit {
  private readonly logger: LoggerService = new Logger(LeadHandlersService.name);
  // private readonly defaultTelegramId = this.configService.getOrThrow('DEFAULT_TG_ID');

  constructor(
    private readonly bot: BotService,
    private readonly leadsService: LeadsService,
    private readonly imagesService: ImagesService,
    private readonly picturesService: PicturesService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {}

  async handleStart(telegramId: number, username?: string, firstname?: string, lastname?: string) {
    await this.leadsService.create(telegramId, username, firstname, lastname);
    const keyboard = createButtonsArray(['English', 'Русский'], ['en', 'ru']);
    await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.greeting(username), keyboard);
  }

  async handleMessage(message: Message, lead: ILead) {
    try {
      console.log(message, message?.photo);
      if (message?.photo) {
        return this.savePicture(message.photo, message.caption, lead);
      }
      if (message?.text) return this.handleTextMessage(message.text, lead);

      // await this.leadsBot.deleteMessage(message.from.id, message.message_id);
    } catch (error) {
      this.logger.error(`Handle message error: ${error.message}`);
    }
  }

  async handleTextMessage(text: string, lead: ILead): Promise<void> {
    const { telegramId, isAdmin } = lead;
    if (text === '/upload' && isAdmin) {
      await this.leadsService.updateTelegramStateByTelegramId(telegramId, TelegramState.UPLOAD);
      await this.bot.sendMessageAndKeyboard(telegramId, 'Mode Upload');
      return;
    }

    if (text === '/random') {
      const { fileId, name } = await this.picturesService.getRandomPicture();
      await this.sendPhotoMessage(telegramId, fileId, name);
      return;
    }

    if (text === '/main') {
      await this.leadsService.updateTelegramStateByTelegramId(telegramId, TelegramState.MAIN);
      await this.bot.sendMessageAndKeyboard(telegramId, 'Mode Main');
      return;
    }
    await this.bot.sendMessageAndKeyboard(telegramId, 'Text');
  }

  async handleCallbackQuery(data: string, lead: ILead, messageId: number): Promise<void> {
    const { telegramId } = lead;
    await this.bot.deleteMessage(telegramId, messageId);
    await this.bot.sendMessageAndKeyboard(telegramId, 'Callback');
    lead.geo = data as Geo;
    await this.leadsService.updateByTelegramId(lead);
  }

  async savePicture(photo: Message['photo'], name: string, { isAdmin, state }: ILead): Promise<void> {
    if (isAdmin && state !== TelegramState.UPLOAD) return;
    // await this.getMessageIdAndDelete(telegramId);
    const bestPhoto = this.getBestResolutionPhoto(photo);
    await this.picturesService.create(name, bestPhoto);
    // await this.sendDescriptionMessage(telegramId);
  }

  private async sendPhotoMessage(
    telegramId: number,
    screenshotId: string,
    text: string,
    keyboard: InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<Message> {
    const file = await this.bot.loadPhoto(screenshotId);
    const photo = await this.imagesService.getTelegramImageBuffer(file.file_path);

    return await this.bot.sendPhotoMessage(telegramId, photo, text, keyboard);
  }

  private getBestResolutionPhoto(photos: Message['photo']): PhotoSize['file_id'] {
    try {
      const fileId = photos.sort((a, b) => b.file_size - a.file_size)[0].file_id;
      if (fileId) return fileId;
    } catch (error) {
      this.logger.debug(`getBestResolutionPhoto message error:${error.message}`);
    }
  }
}
