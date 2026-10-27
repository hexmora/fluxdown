import type { Element, Parent } from 'hast';

import type { GetPropsFunction } from '../../typings';

export const getNativeProps: GetPropsFunction = (node) => {
  const properties = node?.properties ?? {};

  return {
    nativeID: typeof properties.id === 'string' ? properties.id : undefined,
    accessibilityLabel: typeof properties.ariaLabel === 'string' ? properties.ariaLabel : undefined,
    checked: properties.checked === true,
  };
};

export const isLastChild = (current: Element | object, parents: Parent[]) => {
  const parent = parents[parents.length - 1];

  const children = parent?.children.filter((child) => child.type !== 'text' || child.value.trim());

  return children?.[children.length - 1] === current;
};

export const isImageOnlyParagraph = (node: Parent) =>
  node.type === 'element' &&
  'tagName' in node &&
  node.tagName === 'p' &&
  node.children.every(
    (child) =>
      (child.type === 'element' && child.tagName === 'img') ||
      (child.type === 'text' && child.value.trim() === ''),
  );
