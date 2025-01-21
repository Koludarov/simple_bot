export const CHOOSE_LANGUAGE = 'Choose your language:';

const greeting = (name: string) =>
  `Приветствую 🌟${name}🌟, в <b>Simple bot!🥳</b>\n\nWelcome 🌟${name}🌟, to the <b>Simple bot!🥳</b>`;

const chooseLanguage = '<b>Choose your language:</b>';

const moneyMessage = (moneySaved: number) =>
  `Ты уже сэкономил ${moneySaved} динар или ${Math.floor(moneySaved / 117.5)}€, не покупая курилки и стики. Отличная мотивация продолжать!\n`;

const progressMessage = (daysWithoutSmoking: number) =>
  `Ты не куришь уже ${daysWithoutSmoking} дней! Твои лёгкие радуются, а ты становишься здоровее.`;

const notStartedMessage = 'Для начала используй команду /end_smoking, чтобы запустить процесс.';

const endSmokingMessage = `Отлично! Мы будем отслеживать твой прогресс.\nИспользуй /progress и /money для информации`;

const countDesire = (count: number, chartUrl: string) =>
  `Сегодня желание закурить появилось ${count} раз(а). Ты справляешься, продолжай бороться!\n\n<a href='${chartUrl}}'>Рейтинг</a>`;

const progressFact = (decodedFact: string, chartUrl: string) => `${decodedFact}\n\n<a href='${chartUrl}}'>Прогресс</a>`;

const moreThanYear = (daysWithoutSmoking: number, memUrl: string) =>
  `Ты не сдаешься и идешь вперед уже ${daysWithoutSmoking} день🥇\n\n<a href='${memUrl}'>мем</a>`;

export const flowMessages = {
  greeting,
  chooseLanguage,
  moneyMessage,
  progressMessage,
  notStartedMessage,
  endSmokingMessage,
  countDesire,
  progressFact,
  moreThanYear,
};

const errorParkingInput = {
  ru: '<b>Необходимо отправить в формате:</b> <i>/parking NS000AA</i>',
  en: '<b>Need to send command formatted as:</b> <i>/parking NS000AA</i>',
};

const resultPositiveParking = {
  ru: '<b>Билетов на парковку нет</b>',
  en: '<b>No parking tickets was found</b>',
};

const resultNegativeParking = {
  ru: (data: string) => `<b>Список билетов за парковку (кол-во - ${data.length}):</b>\n${JSON.stringify(data)}`,
  en: (data: string) => `<b>List of parking tickets (amount - ${data.length}):</b>\n${JSON.stringify(data)}`,
};

export const messages = { errorParkingInput, resultNegativeParking, resultPositiveParking };

export const dailySmokingPrice = 650;
