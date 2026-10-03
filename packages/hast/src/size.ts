import type { Root as HastRoot } from 'hast';

import { countHast } from './base/size';
import { textContent } from './base/text';

export const sizeOfHast = (root: HastRoot): number => {
  return countHast(root, textContent);
};
