import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

import { VIDEO_EXTENSION } from './lead-bot.constants';
import { LeadBotProvider } from './lead-bot.provider';

@Injectable()
export class LeadBotService {
  constructor(private readonly bot: LeadBotProvider) {}

  async sendMessageAndKeyboard(
    telegramId: number,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<TelegramBot.Message> {
    return await this.bot.sendMessageWithKeyboard(telegramId, text, keyboard);
  }

  async deleteMessage(telegramId: number, messageId: number) {
    return await this.bot.deleteMessage(telegramId, messageId);
  }

  async sendPhotoMessage(
    telegramId: number,
    imageLink: string,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<TelegramBot.Message> {
    return await this.bot.sendPhotoMessage(telegramId, imageLink, text, keyboard);
  }

  async sendVideoMessage(
    telegramId: number,
    videoLink: string,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<TelegramBot.Message> {
    return await this.bot.sendVideoMessage(telegramId, videoLink, text, keyboard);
  }

  async validateTypeMessage(
    mediaLink: string,
    telegramId: number,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<TelegramBot.Message> {
    if (mediaLink) {
      const sendMessage = mediaLink.endsWith(VIDEO_EXTENSION)
        ? this.sendVideoMessage(telegramId, mediaLink, text, keyboard)
        : this.sendPhotoMessage(telegramId, mediaLink, text, keyboard);

      return await sendMessage;
    }
    return await this.sendMessageAndKeyboard(telegramId, text, keyboard);
  }

  async editCaptionAndRemoveKeyboard(telegramId: number, messageId: number, caption: string): Promise<void> {
    await this.bot.editCaptionAndRemoveKeyboard(telegramId, messageId, caption);
  }
}
