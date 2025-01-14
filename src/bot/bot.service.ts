import { Injectable } from '@nestjs/common';
import { File, InlineKeyboardMarkup, Message } from 'node-telegram-bot-api';

import { BotProvider } from './bot.provider';

@Injectable()
export class BotService {
  constructor(private readonly botProvider: BotProvider) {}

  async sendMessageAndKeyboard(
    telegramId: number,
    text: string,
    keyboard: InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<Message> {
    return await this.botProvider.sendMessageWithKeyboard(telegramId, text, keyboard);
  }

  async deleteMessage(telegramId: number, messageId: number) {
    return await this.botProvider.deleteMessage(telegramId, messageId);
  }

  async sendPhotoMessage(
    chatId: number,
    photoBuffer: Buffer,
    text: string,
    keyboard: InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<Message> {
    return await this.botProvider.sendPhotoMessage(chatId, photoBuffer, text, keyboard);
  }

  async sendVideoMessage(
    telegramId: number,
    videoLink: string,
    text: string,
    keyboard: InlineKeyboardMarkup = { inline_keyboard: [] },
  ): Promise<Message> {
    return await this.botProvider.sendVideoMessage(telegramId, videoLink, text, keyboard);
  }

  // async validateTypeMessage(
  //   mediaLink: string,
  //   telegramId: number,
  //   text: string,
  //   keyboard: InlineKeyboardMarkup = { inline_keyboard: [] },
  // ): Promise<Message> {
  //   if (mediaLink) {
  //     const sendMessage = mediaLink.endsWith(VIDEO_EXTENSION)
  //       ? this.sendVideoMessage(telegramId, mediaLink, text, keyboard)
  //       : this.sendPhotoMessage(telegramId, photoBuffer, text, keyboard);

  //     return await sendMessage;
  //   }
  //   return await this.sendMessageAndKeyboard(telegramId, text, keyboard);
  // }

  async loadPhoto(photoId: string): Promise<File> {
    return await this.botProvider.loadPhoto(photoId);
  }

  async editCaptionAndRemoveKeyboard(telegramId: number, messageId: number, caption: string): Promise<void> {
    await this.botProvider.editCaptionAndRemoveKeyboard(telegramId, messageId, caption);
  }
}
