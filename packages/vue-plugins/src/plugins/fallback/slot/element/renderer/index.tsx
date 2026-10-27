import { h } from 'vue';

import type { ElementProps } from '../../../../../base';

import { isSafeTagName } from '../../../../../base';
import { VOID_TAG_NAMES } from './consts';

export const ElementRenderer = ({ Raw: _Raw, children, tagName, ...props }: ElementProps) => {
  if (!isSafeTagName(tagName)) {
    return null;
  }

  return VOID_TAG_NAMES.includes(tagName) ? h(tagName, props) : h(tagName, props, [children]);
};

ElementRenderer.inheritAttrs = false;
