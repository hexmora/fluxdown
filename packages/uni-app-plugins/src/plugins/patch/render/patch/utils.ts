import type { ElementContent } from 'hast';

import { isString } from 'lodash-es';

import type { PatchElement } from './type';

export const isPatchNode = (node: ElementContent): node is PatchElement =>
  node.type === 'element' &&
  node.tagName === 'span' &&
  node.properties?.dataParserPatch === '1' &&
  isString(node.properties.dataPatchKey);
