import type { Element, ElementContent } from 'hast';

import {
  SHAD_DATA_ATTR,
  SHAD_FADE_VALUE,
  SHAD_TAG_NAME,
} from '@fluxdown/core-presets/plugins/mapper/shad';
import { toNumber } from 'lodash-es';

import { isElementWithTag } from '../../../../base';

export const isShadNode = (node: ElementContent): node is Element =>
  isElementWithTag(node, SHAD_TAG_NAME) && node.properties[SHAD_DATA_ATTR] === SHAD_FADE_VALUE;

const getNumber = (value: unknown, fallback: number) => {
  const number = toNumber(value);

  return Number.isFinite(number) ? number : fallback;
};

export const getShadConfig = ({ properties }: Element) => ({
  start: Math.max(-1, getNumber(properties.dataShadStart, -1)),
  duration: Math.max(0, getNumber(properties.dataShadDuration, 400)),
});
