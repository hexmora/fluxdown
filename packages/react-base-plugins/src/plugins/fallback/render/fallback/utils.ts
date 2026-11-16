import type { Parent, Text } from 'hast';

import { isHastElement } from '../../../../base';

export const isTableWhitespace = (node: Text, parent: Parent | undefined): boolean => {
  return Boolean(
    parent &&
    isHastElement(parent) &&
    /^(?:table|thead|tbody|tfoot|tr|colgroup)$/.test(parent.tagName) &&
    /^\s*$/.test(node.value),
  );
};
