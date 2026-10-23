import type { Element, ElementContent } from 'hast';

import { CHUNK_DATA_ATTR, CHUNK_TAG_NAME } from '@fluxdown/core-presets/plugins/mapper/chunk';
import { toNumber } from 'lodash-es';

import { isElementWithTag } from '../../../../base';

export const isChunkNode = (node: ElementContent): node is Element =>
  isElementWithTag(node, CHUNK_TAG_NAME) && node.properties[CHUNK_DATA_ATTR] === '1';

const getNumber = (value: unknown, fallback: number) => {
  const number = toNumber(value);

  return Number.isFinite(number) ? number : fallback;
};

export const getChunkConfig = ({ properties }: Element) => ({
  start: Math.max(-1, getNumber(properties.dataChunkStart, -1)),
  duration: Math.max(0, getNumber(properties.dataChunkDuration, 400)),
});
