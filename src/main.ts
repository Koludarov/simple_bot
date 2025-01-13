import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { CustomLogger } from '../logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logLevel = configService.get<string>('LOG_LEVEL', 'info');
  const logPretty = configService.get<string>('LOG_PRETTY')?.toLowerCase().startsWith('true') || false;

  const logger = new CustomLogger(logLevel, logPretty);

  app.useLogger(logger);

  // Configure global logging options
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return errors;
      },
    }),
  );

  const API_PREFIX = configService.get('API_PREFIX');
  const API_VERSION = configService.get('API_VERSION');
  app.setGlobalPrefix(`${API_PREFIX}${API_VERSION}`);

  const HTTP_PORT = configService.get('HTTP_PORT');

  app.use(helmet());

  await app.listen(HTTP_PORT);
}
bootstrap();
