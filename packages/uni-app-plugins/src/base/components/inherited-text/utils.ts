import { getTextWords } from '@fluxdown/hast';

export const splitInlineText = (value: string | number) => {
  const words: string[] = [];

  for (const word of getTextWords(String(value).replace(/[\t\r\n]/g, ' '))) {
    const text = word.replace(/ /g, '\u00a0');

    if (/^\s+$/.test(word) && words.length) {
      words[words.length - 1] += text;
    } else {
      words.push(text);
    }
  }

  return words;
};
