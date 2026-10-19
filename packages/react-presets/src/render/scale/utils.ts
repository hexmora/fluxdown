import type { Element, ElementContent } from 'hast';

import {
  SCALE_CHAR_VALUE,
  SCALE_DATA_ATTR,
  SCALE_TAG_NAME,
  SCALE_WORD_VALUE,
} from '@fluxdown/core-presets/mapper';
import { toNumber } from 'lodash-es';

import { isElementWithTag } from '../../base';

export const isScaleNode = (node: ElementContent): node is Element => {
  return (
    isElementWithTag(node, SCALE_TAG_NAME) &&
    (node.properties[SCALE_DATA_ATTR] === SCALE_CHAR_VALUE ||
      node.properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE)
  );
};

const getNumber = (value: unknown, fallback: number) => {
  const number = toNumber(value);

  return Number.isFinite(number) ? number : fallback;
};

export const getScaleConfig = ({ properties }: Element) => {
  return {
    start: Math.max(0, getNumber(properties.dataScaleStart, 0)),
    duration: Math.max(0, getNumber(properties.dataScaleDuration, 200)),
    from: Math.max(0, Math.min(1, getNumber(properties.dataScaleFrom, 0))),
    blur: Math.max(0, getNumber(properties.dataScaleBlur, 0.08)),
  };
};
