import type { Text } from 'mdast';

import { characterEntities } from 'character-entities';
import { sortBy, sortedIndex } from 'lodash-es';

import { isRepairMarker } from '../../../utils';

const ENTITY_NAMES = /*#__PURE__*/ sortBy(Object.keys(characterEntities));
/** Only hold suffixes that can still become a CommonMark character reference. */
export const getIncompleteEntityCutoff = (node: Text): number | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return;
  }

  const match = /&(#(?:[xX][\da-fA-F]{0,6}|\d{0,7})?|[a-zA-Z][a-zA-Z\d]*)?$/.exec(source);

  if (!match || !node.value.endsWith(match[0])) {
    return;
  }

  const offset = node.value.length - match[0].length;

  if (!isRepairMarker(node, offset, match[0].length)) {
    return;
  }

  const name = match[1] ?? '';

  // Named references inside words overlap common acronyms and query strings.
  if (!name.startsWith('#') && /[\p{L}\p{N}]$/u.test(node.value.slice(0, offset))) {
    return;
  }

  if (name && !name.startsWith('#')) {
    const index = sortedIndex(ENTITY_NAMES, name);

    if (!ENTITY_NAMES[index]?.startsWith(name)) {
      return;
    }
  }

  return offset;
};
