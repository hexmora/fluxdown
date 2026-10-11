import type { StateMapper } from 'stative';

import type { IBlockSection } from '../../../base';
import type { BlockCompilerItem } from '../type';

import { isSectionEqual } from '../../../base/text-chunker/utils';

export const getItems: StateMapper<IBlockSection[], BlockCompilerItem[]> = (current, previous) => {
  const [, items] = previous ?? [];

  let charEnd = 0;

  return current.map((section, currentIndex) => {
    const charStart = charEnd;

    charEnd += section.text.length;

    const isLast = currentIndex === current.length - 1;

    const prev = items?.[currentIndex];

    const sameSection = prev && isSectionEqual(prev.section, section);

    if (
      prev &&
      prev.isLast === isLast &&
      prev.meta.charStart === charStart &&
      prev.meta.charEnd === charEnd &&
      sameSection
    ) {
      return prev;
    }

    return {
      section: sameSection ? prev.section : section,
      meta: { charStart, charEnd, currentIndex },
      isLast,
    };
  });
};
