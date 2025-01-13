import { InlineKeyboardMarkup } from 'node-telegram-bot-api';

function groupBy<T>(items: T[], n: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / n) }, (_, index) => items.slice(index * n, index * n + n));
}

export function makeButtonsEnum(enumObject: Record<string, string>, row = 1) {
  const enumValues = Object.values(enumObject);
  return {
    inline_keyboard: groupBy(
      enumValues.map((item) => ({ text: item, callback_data: item })),
      row,
    ),
  };
}

export function createButtonsArray<T extends string>(buttons: T[], actions: T[], row = 1): InlineKeyboardMarkup {
  const combinedButtons = buttons.map((text, index) => {
    return { text, callback_data: actions[index] || text };
  });
  return { inline_keyboard: groupBy(combinedButtons, row) };
}
