import type { Heading } from 'mdast';

export const isEmptyHeading = (heading: Heading): boolean => {
  return heading.children.every(
    (child) => child.type === 'text' && child.value.trim().length === 0,
  );
};
