import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { firstValueFrom } from 'rxjs';

import { commands, sideMenu } from './bot.constants';
import { ParseBotModes } from '../common/parse-bot.enum';

@Injectable()
export class BotProvider implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly logger: LoggerService = new Logger(BotProvider.name);
  private readonly botToken: string;
  private readonly allowedBotUpdates: string[] = ['message', 'callback_query'];
  private readonly telegramBotApiUrl = 'https://api.telegram.org/bot';

  constructor(
    private configService: ConfigService,
    private readonly httpClient: HttpService,
  ) {
    this.botToken = this.configService.get('LEADS_BOT_TOKEN');
    this.bot = new TelegramBot(this.botToken, { polling: false });
    this.bot.setMyCommands([
      { command: commands.want_smoke, description: sideMenu.WANT_SMOKE },
      { command: commands.progress, description: sideMenu.PROGRESS },
      { command: commands.money, description: sideMenu.MONEY },
      { command: commands.endSmoking, description: sideMenu.END_SMOKING },
      { command: commands.random, description: sideMenu.RANDOM },
      { command: commands.smokingMeme, description: sideMenu.SMOKING_MEME },
      { command: commands.language, description: sideMenu.LANGUAGE },
    ]);
  }

  async sendMessageWithKeyboard(
    telegramId: number,
    message: string,
    inline_keyboard: TelegramBot.InlineKeyboardMarkup,
  ): Promise<TelegramBot.Message> {
    try {
      return await this.bot.sendMessage(telegramId, message, {
        reply_markup: inline_keyboard,
        parse_mode: ParseBotModes.HTML,
      });
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async sendPhotoMessage(
    chatId: number,
    photoBuffer: Buffer,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<TelegramBot.Message> {
    try {
      return await this.bot.sendPhoto(chatId, photoBuffer, {
        caption: text,
        reply_markup: keyboard,
      });
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async sendVideoMessage(
    chatId: number,
    videoLink: string,
    text: string,
    inline_keyboard: TelegramBot.InlineKeyboardMarkup,
  ): Promise<TelegramBot.Message> {
    try {
      return await this.bot.sendVideo(chatId, videoLink, {
        caption: text,
        reply_markup: inline_keyboard,
        parse_mode: ParseBotModes.HTML,
      });
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async deleteMessage(telegramId: number, messageId: number) {
    try {
      await this.bot.deleteMessage(telegramId, messageId);
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async editCaptionAndRemoveKeyboard(telegramId: number, messageId: number, caption: string): Promise<void> {
    try {
      await this.bot.editMessageText(caption, {
        chat_id: telegramId,
        message_id: messageId,
      });
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async loadPhoto(photoId: string): Promise<TelegramBot.File> {
    try {
      const file = await this.bot.getFile(photoId);
      return file;
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async onModuleInit() {
    const webHookUrl = this.getWebHookUrl();

    await this.setWebHook(webHookUrl);

    const webHookInfo = await this.getWebHookInfo();
    const isWebHookValid = await this.validateWebHook(webHookInfo, webHookUrl);

    if (!isWebHookValid) {
      throw new Error(`Webhook url is not set correctly for leads bot: ${JSON.stringify(webHookInfo)}`);
    }

    this.logger.log('Webhook url is set correctly for leads bot');
  }

  private async setWebHook(webHookUrl: string): Promise<boolean> {
    this.logger.debug('Start setting webhook for leads bot');

    const setWebhookParams = { url: webHookUrl, allowed_updates: this.allowedBotUpdates };

    const { data: setResult } = await firstValueFrom(
      this.httpClient.post(`${this.telegramBotApiUrl}${this.botToken}/setWebhook`, setWebhookParams),
    );
    this.logger.debug(setResult);

    return setResult.result;
  }

  private async getWebHookInfo() {
    const {
      data: { result: webHookInfo },
    } = await firstValueFrom(this.httpClient.get(`${this.telegramBotApiUrl}${this.botToken}/getWebhookInfo`));
    this.logger.debug(webHookInfo);

    return webHookInfo;
  }

  private validateWebHook(webHookInfo: TelegramBot.SetWebHookOptions, webHookUrl: string): boolean {
    return Boolean(
      webHookInfo.url === webHookUrl ||
        webHookInfo.allowed_updates.sort().toString() === this.allowedBotUpdates.sort().toString(),
    );
  }

  private getWebHookUrl() {
    const host = this.configService.get('WEBHOOK_HOST');
    const apiPrefix = this.configService.get('API_PREFIX');
    const apiVersion = this.configService.get('API_VERSION');
    const path = `${apiPrefix}${apiVersion}/telegram-updates/leads`;
    return `${host}${path}`;
  }
}
