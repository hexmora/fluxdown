import type { RootContent, Text } from 'mdast';

import { withoutRepairSource } from '../../../utils';

export const getAdjacentTextChildren = (source: RootContent[]): RootContent[] | undefined => {
  const children: RootContent[] = [];

  let currentText: Text | undefined;

  let changed = false;

  for (const child of source) {
    if (child.type !== 'text') {
      children.push(child);

      currentText = undefined;

      continue;
    }

    if (child.value.length === 0) {
      changed = true;

      continue;
    }

    if (!currentText) {
      children.push(child);

      currentText = child;

      continue;
    }

    currentText = withoutRepairSource({ ...currentText, value: currentText.value + child.value });

    children[children.length - 1] = currentText;

    changed = true;
  }

  return changed ? children : undefined;
};
