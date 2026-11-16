import { isHastElement, type TexProps } from '@fluxdown/react-base-plugins/base';

export const getTexRoot = (mode: TexProps['mode'], parents: TexProps['parents']) => {
  const phrasing = parents.some(
    (parent) => isHastElement(parent) && /^(?:p|h[1-6]|span|a|em|strong|del)$/.test(parent.tagName),
  );

  return mode === 'display' && !phrasing ? 'div' : 'span';
};
