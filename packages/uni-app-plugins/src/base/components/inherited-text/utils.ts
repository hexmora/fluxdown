import { getTextWords } from '@fluxdown/hast';

export const toText = (value: string) => {
  // The suffix avoids native Text's approximate width for an isolated character.
  return `${value.replaceAll(' ', '\u00a0')}\u200b`;
};

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
