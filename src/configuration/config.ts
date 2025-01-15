import * as pack from '../../package.json';

export default (): any =>
  ({
    API_PREFIX: '/api',
    API_VERSION: '/v1',
    SERVICE_NAME: pack.name,
    HTTP_PORT: Number(process.env.HTTP_PORT),
    LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
    SECRET_JWT: process.env.SECRET_JWT,
    LEADS_BOT_TOKEN: process.env.LEADS_BOT_TOKEN,
    WEBHOOK_HOST: process.env.WEBHOOK_HOST,
    MONGO_URI: process.env.MONGO_URI,
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE,
    DEFAULT_PLATES: process.env.DEFAULT_PLATES,
  }) as const;
