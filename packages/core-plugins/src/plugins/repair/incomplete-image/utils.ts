import type { PhrasingContent } from 'mdast';

export const getResourceLabel = (children: PhrasingContent[]): string =>
  children
    .map((child): string => {
      if ('children' in child) {
        return getResourceLabel(child.children);
      }

      if (child.type === 'image' || child.type === 'imageReference') {
        return child.alt ?? '';
      }

      return 'value' in child ? String(child.value) : '';
    })
    .join('');
