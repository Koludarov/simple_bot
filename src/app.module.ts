import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import config from './configuration/config';
import { HealthModule } from './health/health.module';
import { LeadBotModule } from './lead-bot/lead-bot.module';
import { LeadHandlersModule } from './lead-bot-handlers/lead-bot-handlers.module';
import { LeadsModule } from './leads/leads.module';
import { LoggerMiddleware } from './logger.middleware';
import { TelegramUpdatesModule } from './telegram-updates/telegram-updates.module';
import { GlobalExceptionFilter } from './utils/filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    // MongooseModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.getOrThrow('MONGO_URI'),
    //   }),
    // }),
    HealthModule,
    TelegramUpdatesModule,
    LeadBotModule,
    LeadHandlersModule,
    // LeadsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
