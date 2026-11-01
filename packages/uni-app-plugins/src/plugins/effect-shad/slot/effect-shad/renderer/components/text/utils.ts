import { getTextUnits } from '@fluxdown/hast';

import { splitInlineText } from '../../../../../../../base/components/inherited-text/utils';

interface ShadWord {
  key: string;

  text: string;

  trailing?: string;

  tail: boolean;
}

export const toShadWords = (text: string, trailingText: string, prefix: number, offset: number) => {
  const words = splitInlineText(text);

  let cursor = 0;

  let position = offset;

  return words.map((word): ShadWord => {
    const key = `shad-${position}`;

    cursor += word.length;

    position += [...getTextUnits(word)].length;

    return {
      key,
      text: word,
      trailing: cursor > prefix ? text.slice(cursor) + trailingText : undefined,
      tail: cursor === text.length && trailingText.length === 0 && !/\s$/.test(word),
    };
  });
};
