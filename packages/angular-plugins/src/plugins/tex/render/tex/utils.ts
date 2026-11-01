import type { AngularRenderMatchParams } from '@fluxdown/angular-plugins/typings';

import { getTextContent } from '@fluxdown/angular-plugins/base';

import type { TexMode } from './type';

export const getTexMode = ({ node }: AngularRenderMatchParams): TexMode | null => {
  if (node.type !== 'element' || node.tagName !== 'span') {
    return null;
  }

  const dataType = node.properties?.dataType;

  if (dataType === 'inline-math') {
    return 'inline';
  }

  if (dataType === 'block-math') {
    return 'display';
  }

  return null;
};

export const getTex = ({ node }: AngularRenderMatchParams) => {
  if (getTexMode({ node, parents: [] }) === null) {
    return null;
  }

  const tex = getTextContent(node).trim();

  return tex || null;
};
