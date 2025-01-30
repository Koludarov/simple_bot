import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InlineKeyboardMarkup, Message, PhotoSize } from 'node-telegram-bot-api';
import { firstValueFrom } from 'rxjs';

import { dailySmokingPrice, flowMessages } from './lead-bot-handlers.constants';
import { commands } from '../bot/bot.constants';
import { BotService } from '../bot/bot.service';
import { TelegramState } from '../common/telegram-states';
import { FactsService } from '../facts/facts.service';
import { ImagesService } from '../images/images.service';
import { ILead } from '../leads/lead.interface';
import { LeadsService } from '../leads/leads.service';
import { PicturesService } from '../pictures/pictures.service';
import { generateChartUrl, generateSmokingDesireChartUrl } from '../utils/create-chart';
import { createButtonsArray } from '../utils/create-inline-keyboard';
import { Geo } from '../utils/enums';

@Injectable()
export class LeadHandlersService implements OnModuleInit {
  private readonly logger: LoggerService = new Logger(LeadHandlersService.name);
  private readonly defaultTPlates: string = this.configService.getOrThrow('DEFAULT_PLATES');
  private readonly googleEngineId: string = this.configService.getOrThrow('GOOGLE_ENGINE_ID');
  private readonly googleSearchApiKey: string = this.configService.getOrThrow('GOOGLE_SEARCH_API');
  private readonly redditClientId: string = this.configService.getOrThrow('REDDIT_CLIENT_ID');
  private readonly redditClientSecret: string = this.configService.getOrThrow('REDDIT_CLIENT_SECRET');
  private readonly redditQueries: string[] = this.configService.getOrThrow('REDDIT_QUERIES').split(',');

  constructor(
    private readonly bot: BotService,
    private readonly leadsService: LeadsService,
    private readonly imagesService: ImagesService,
    private readonly picturesService: PicturesService,
    private readonly factsService: FactsService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyNote() {
    const leads = await this.leadsService.getAllNonSmokers();

    this.logger.log(`Starting to send daily notes, leads amount: ${leads.length}`);
    for (const lead of leads) {
      const daysWithoutSmoking = this.getDaysWithoutSmoking(lead);

      lead.moneySaved = (lead.moneySaved || 0) + dailySmokingPrice;

      await this.leadsService.updateByTelegramId(lead);
      const [memUrl] = await this.getRandomMemeWithTopic();

      if (daysWithoutSmoking > 365) {
        await this.bot.sendMessageAndKeyboard(lead.telegramId, flowMessages.moreThanYear(daysWithoutSmoking, memUrl));
        return;
      }

      const fact = await this.factsService.getByDay(daysWithoutSmoking);
      const decodedTask = Buffer.from(fact.task, 'base64').toString('utf-8');

      await this.bot.sendMessageAndKeyboard(lead.telegramId, `${decodedTask}\n\n<a href='${memUrl}'>мем</a>`);
    }

    this.logger.log(`Ending to send daily notes`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyMem() {
    const leads = await this.leadsService.getAll();

    this.logger.log(`Starting to send daily memes, leads amount: ${leads.length}`);

    for (const { telegramId } of leads) {
      const [memUrl, topic] = await this.getRandomMemeWithTopic();

      await this.bot.sendMessageAndKeyboard(telegramId, `Опа <a href='${memUrl}'>мемчик</a>\n\nТема: ${topic}`);
    }

    this.logger.log(`Ending to send daily memes`);
  }

  // Delete after Test is finished
  @Cron(CronExpression.EVERY_MINUTE)
  async sendTestCronMeme() {
    const leads = await this.leadsService.getAll();

    this.logger.log(`Starting to send daily memes, leads amount: ${leads.length}`);

    for (const { telegramId } of leads) {
      const [memUrl, topic] = await this.getRandomMemeWithTopic();

      await this.bot.sendMessageAndKeyboard(telegramId, `Опа <a href='${memUrl}'>мемчик</a>\n\nТема: ${topic}`);
    }

    this.logger.log(`Ending to send daily memes`);
  }

  async handleStart(telegramId: number, username?: string, firstname?: string, lastname?: string) {
    await this.leadsService.create(telegramId, username, firstname, lastname);
    await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.greeting(username));
    await this.sendChooseLanguageMessage(telegramId);
  }

  async handleMessage(message: Message, lead: ILead) {
    try {
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

    if (text === commands.random) {
      const { fileId, name } = await this.picturesService.getRandomPicture();
      await this.sendPhotoMessage(telegramId, fileId, name);
      return;
    }

    if (text === commands.language) return await this.sendChooseLanguageMessage(telegramId);

    if (text === commands.endSmoking) return this.handleEndSmoking(lead);

    if (text === commands.progress) return this.handleProgress(lead);

    if (text === commands.want_smoke) return this.handleWantSmokeCommand(lead);

    if (text.startsWith(commands.spend)) {
      const spending = parseInt(text.split(' ')[1]);
      return await this.handleSpendCommand(lead, spending);
    }

    if (text.startsWith(commands.money)) {
      const splitted = text.split(' ');
      const query = splitted[1] ? splitted.slice(1).join('') : undefined;
      return await this.handleMoney(lead, query);
    }

    if (text.startsWith(commands.smokingMeme)) {
      return await this.handleSmokingMeme(lead);
    }

    // TODO: finish checkParking method
    // if (text.startsWith(commands.parking)) {
    //   const plates = text.split(' ')[1];
    //   return await this.checkParking(lead, plates);
    // }

    if (text === '/main') {
      await this.leadsService.updateTelegramStateByTelegramId(telegramId, TelegramState.MAIN);
      await this.bot.sendMessageAndKeyboard(telegramId, 'Mode Main');
      return;
    }
  }

  async handleCallbackQuery(data: string, lead: ILead, messageId: number): Promise<void> {
    const { telegramId } = lead;
    await this.bot.deleteMessage(telegramId, messageId);
    lead.geo = data as Geo;
    await this.leadsService.updateByTelegramId(lead);
  }

  async savePicture(photo: Message['photo'], name: string, { telegramId, isAdmin, state }: ILead): Promise<void> {
    if (isAdmin && state !== TelegramState.UPLOAD) return;
    const bestPhoto = this.getBestResolutionPhoto(photo);
    await this.picturesService.create(name, bestPhoto);
    await this.bot.sendMessageAndKeyboard(telegramId, `${name} saved`);
  }

  async handleSmokingMeme({ telegramId }: ILead): Promise<void> {
    const [memUrl, topic] = await this.getRandomMemeWithTopic();
    await this.bot.sendMessageAndKeyboard(telegramId, `Получай\n<a href='${memUrl}'>мем</a>\n\nТема: ${topic}`);
  }

  // TODO: Need to upgrade headers
  // async checkParking({ telegramId, isAdmin, geo }: ILead, inputPlates?: string): Promise<void> {
  //   if (!inputPlates && !isAdmin) {
  //     await this.bot.sendMessageAndKeyboard(telegramId, messages.errorParkingInput[geo]);
  //     return;
  //   }
  //   const plates = inputPlates ? inputPlates : this.defaultTPlates;
  //   try {
  //     const { data } = await firstValueFrom(
  //       this.httpService.get(`https://portal.parkingns.rs/portal/auth/checkPPK?platePr=${plates}`, {
  //         headers: {
  //           'User-Agent':
  //             'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  //           Accept: 'application/json, text/plain, */*',
  //           Connection: 'keep-alive',
  //           Host: 'portal.parkingns.rs',
  //         },
  //       }),
  //     );
  //     const answer = data.length ? messages.resultNegativeParking[geo](data) : messages.resultPositiveParking[geo];

  //     await this.bot.sendMessageAndKeyboard(telegramId, answer);
  //   } catch (error) {
  //     this.logger.log(`Error sending request: ${error}`);
  //   }
  //   return;
  // }

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

  private async sendChooseLanguageMessage(telegramId: number): Promise<void> {
    const keyboard = createButtonsArray(['English', 'Русский'], ['en', 'ru']);
    await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.chooseLanguage, keyboard);
  }

  private async handleEndSmoking(lead: ILead): Promise<void> {
    const { telegramId } = lead;
    lead.smokingEndDate = new Date();
    lead.moneySaved = 0;
    await this.leadsService.updateByTelegramId(lead);
    await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.endSmokingMessage);
  }

  private async handleProgress(lead: ILead): Promise<void> {
    const { telegramId } = lead;
    const daysWithoutSmoking = this.getDaysWithoutSmoking(lead);

    if (daysWithoutSmoking === undefined) {
      await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.notStartedMessage);
      return;
    }

    const [memUrl] = await this.getRandomMemeWithTopic();
    if (daysWithoutSmoking > 365) {
      await this.bot.sendMessageAndKeyboard(lead.telegramId, flowMessages.moreThanYear(daysWithoutSmoking, memUrl));
      return;
    }

    await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.progressMessage(daysWithoutSmoking));

    if (daysWithoutSmoking > 0) {
      const encodedFact = await this.factsService.getByDay(daysWithoutSmoking);
      const decodedFact = Buffer.from(encodedFact.message, 'base64').toString('utf-8');
      const chartUrl = generateChartUrl(daysWithoutSmoking);

      await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.progressFact(decodedFact, chartUrl));
    }
  }

  private async handleMoney(lead: ILead, query: string = 'buy smart devices'): Promise<void> {
    const { telegramId, moneySaved } = lead;
    const daysWithoutSmoking = this.getDaysWithoutSmoking(lead);

    if (daysWithoutSmoking === undefined) {
      await this.bot.sendMessageAndKeyboard(telegramId, flowMessages.notStartedMessage);
      return;
    }

    const products = await this.searchProductsOnGoogle(query, moneySaved);
    let response = flowMessages.moneyMessage(moneySaved);

    products.forEach((product) => {
      response += `- <a href='${product.link}'>${product.title}</a>\n  ${product.snippet}\n\n`;
    });

    await this.bot.sendMessageAndKeyboard(telegramId, response);
  }

  async searchProductsOnGoogle(query: string, budget: number): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: this.googleSearchApiKey,
            cx: this.googleEngineId,
            q: `${query} up to ${Math.floor(budget / 117.5)}€`,
            num: 5,
          },
        }),
      );

      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    } catch (error) {
      this.logger.error(`Error while calling Google Custom Search API: ${error.message}`);
      return [];
    }
  }

  private getDaysWithoutSmoking(lead: ILead): number {
    const { smokingEndDate } = lead;
    if (!smokingEndDate) {
      return;
    }

    const startDate = new Date(smokingEndDate);
    const now = new Date();
    return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  async handleWantSmokeCommand(lead: ILead): Promise<void> {
    const daysWithoutSmoking = this.getDaysWithoutSmoking(lead);
    if (daysWithoutSmoking === undefined) {
      await this.bot.sendMessageAndKeyboard(lead.telegramId, flowMessages.notStartedMessage);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    lead.desireSmokingInc[today] = (lead.desireSmokingInc[today] || 0) + 1;

    await this.leadsService.updateByTelegramId(lead);

    const count = lead.desireSmokingInc[today];
    const chartUrl = generateSmokingDesireChartUrl(lead.desireSmokingInc);
    await this.bot.sendMessageAndKeyboard(lead.telegramId, `${flowMessages.countDesire(count, chartUrl)}`);
  }

  async handleSpendCommand(lead: ILead, spending: number): Promise<void> {
    if (!spending) {
      await this.bot.sendMessageAndKeyboard(lead.telegramId, flowMessages.notAvailableAmount);
      return;
    }

    const daysWithoutSmoking = this.getDaysWithoutSmoking(lead);
    if (daysWithoutSmoking === undefined) {
      await this.bot.sendMessageAndKeyboard(lead.telegramId, flowMessages.notStartedMessage);
      return;
    }

    lead.moneySaved = (lead.moneySaved || 0) - spending;

    await this.leadsService.updateByTelegramId(lead);

    await this.bot.sendMessageAndKeyboard(lead.telegramId, `${flowMessages.newMoneyAmount(lead.moneySaved)}`);
  }

  async getRandomMemeWithTopic(): Promise<Array<string>> {
    const randomIndex = Math.floor(Math.random() * this.redditQueries.length);
    const randomQuery = this.redditQueries[randomIndex];
    this.logger.log(`Mem query: ${randomQuery}`);

    const url = `https://oauth.reddit.com/r/memes/search.json?q=${randomQuery}&limit=250`;

    const authToken = await this.getRedditAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'User-Agent': 'meme_bot/1.0',
          },
        }),
      );

      const posts = response.data.data.children;

      const imagePosts = posts.filter((post: any) => post.data.post_hint === 'image' && post.data.url);

      if (imagePosts.length === 0) {
        return;
      }

      const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
      return [randomPost.data.url, randomQuery];
    } catch (error) {
      this.logger.error(`Error while fetching mem : ${error.message}`);
    }
  }

  async getRedditAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.redditClientId}:${this.redditClientSecret}`).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.reddit.com/api/v1/access_token',
          new URLSearchParams({
            grant_type: 'client_credentials',
          }),
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Error while getting access token: ${error.response?.data || error.message}`);
      throw error;
    }
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
