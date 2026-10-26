import type { Element, ElementContent } from 'hast';

import {
  SHAD_DATA_ATTR,
  SHAD_HOST_VALUE,
  SHAD_TAG_NAME,
} from '@fluxdown/core-plugins/plugins/mapper/shad';
import { toNumber } from 'lodash-es';

import { isElementWithTag } from '../../../../base';

export const isShadNode = (node: ElementContent): node is Element => {
  return (
    isElementWithTag(node, SHAD_TAG_NAME) && node.properties[SHAD_DATA_ATTR] === SHAD_HOST_VALUE
  );
};

export const getShadConfig = ({ properties }: Element) => {
  const maskWidth = toNumber(properties.dataShadMaskWidth);

  const offset = toNumber(properties.dataShadOffset);

  return {
    maskWidth: Number.isFinite(maskWidth) ? Math.max(0, maskWidth) : 15,
    offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
  };
};
