import type { Element, ElementContent } from 'hast';

export const getListItems = (node: ElementContent): Element[] =>
  node.type === 'element'
    ? node.children.filter(
        (child): child is Element => child.type === 'element' && child.tagName === 'li',
      )
    : [];

export const isTaskItem = (node: Element): boolean =>
  node.children.some(
    (child) =>
      child.type === 'element' &&
      (child.tagName === 'input' || (child.tagName === 'p' && isTaskItem(child))),
  );
