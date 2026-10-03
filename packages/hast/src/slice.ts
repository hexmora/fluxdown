import type { Root as HastRoot } from 'hast';

import { copyHastRange } from './base/slice';
import { textContent } from './base/text';

export const sliceHast = (
  root: HastRoot,
  startIndex: number,
  endIndex: number,
): HastRoot | null => {
  return copyHastRange(root, startIndex, endIndex, textContent);
};
