import type { Element, RootContent } from 'hast';

import { SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '@fluxdown/core-presets/mapper';

import type { HastRoot } from '../../typings';

import { collectText } from '../smooth/utils';

const findFades = (node: HastRoot | RootContent): Element[] => {
  if (node.type === 'element' && node.properties[SHAD_DATA_ATTR] === SHAD_FADE_VALUE) {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(findFades) : [];
};

/**
 * Fading runs in document order, with the entrance each one plays.
 */
export const readFades = (root: HastRoot) =>
  findFades(root).map((node) => ({
    text: collectText(node),
    start: node.properties.dataShadStart as number,
    duration: node.properties.dataShadDuration as number,
  }));
