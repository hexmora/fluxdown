import type { Root } from 'hast';

import { toState } from 'stative';

export const EMPTY_ROOT = /*#__PURE__*/ toState<Root | null>(null);

export const BLOCK_CONTAINERS = [
  'blockquote',
  'ol',
  'ul',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
];
