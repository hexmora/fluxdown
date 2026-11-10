import type { Text } from 'mdast';

import { nth } from 'lodash-es';

import { getRepairSourceOffset } from '../../../utils';

export const getTrailingEscapeValue = (node: Text): string | undefined => {
  const source = node.data?.source;

  if (source === undefined || !node.value.endsWith('\\')) {
    return;
  }

  const offset = getRepairSourceOffset(node, node.value.length - 1);

  if (offset === undefined) {
    return;
  }

  let trailingEscapes = 0;

  for (let index = offset; index >= 0 && nth(source, index) === '\\'; index -= 1) {
    trailingEscapes += 1;
  }

  return trailingEscapes % 2 === 1 ? node.value.slice(0, -1) : undefined;
};
