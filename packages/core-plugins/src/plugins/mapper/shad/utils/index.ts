import type { Element, ElementContent, Root as HastRoot, RootContent } from 'hast';

import { clamp, floor } from 'lodash-es';

import { SHAD_DATA_ATTR, SHAD_HOST_VALUE, SHAD_TAG_NAME } from './consts';
import { splitChildren } from './partition';
import { getTailRange } from './tail';

export { SHAD_DATA_ATTR, SHAD_HOST_VALUE, SHAD_TAG_NAME } from './consts';

const createPart = (children: RootContent[]): Element => ({
  type: 'element',
  tagName: SHAD_TAG_NAME,
  properties: {},
  // An empty element counts as one visible unit. An empty text keeps this part zero-width.
  children: children.length > 0 ? (children as ElementContent[]) : [{ type: 'text', value: '' }],
});

export interface CreateShadRootParams {
  root: HastRoot;

  length: number;

  activeLength: number;

  maskWidth?: number;
}

export const createShadRoot = ({ root, ...params }: CreateShadRootParams): HastRoot => {
  const length = floor(params.length);

  if (!(length > 0)) {
    return root;
  }

  const range = getTailRange(root, length);

  if (!range) {
    return root;
  }

  const result: HastRoot = { ...root, children: root.children.slice() };
  let parent: HastRoot | Element = result;

  for (const index of range.path) {
    const child = parent.children[index];

    if (child?.type !== 'element') {
      return root;
    }

    const copy: Element = { ...child, children: child.children.slice() };
    parent.children[index] = copy;
    parent = copy;
  }

  const activeLength = clamp(floor(params.activeLength) || 0, 0, range.end - range.start);
  const affected = parent.children.slice(range.startIndex, range.endIndex);
  const [prefix, rest] = splitChildren(affected, range.start);
  const [leading, tail] = splitChildren(rest, range.end - range.start - activeLength);
  const [active, suffix] = splitChildren(tail, activeLength);

  const maskWidth = params.maskWidth ?? 15;

  const host: Element = {
    type: 'element',
    tagName: SHAD_TAG_NAME,
    properties: {
      [SHAD_DATA_ATTR]: SHAD_HOST_VALUE,
      dataShadMaskWidth: Number.isFinite(maskWidth) ? Math.max(0, maskWidth) : 15,
    },
    children: [createPart(leading), createPart(active)],
  };

  parent.children.splice(
    range.startIndex,
    range.endIndex - range.startIndex,
    ...([...prefix, host, ...suffix] as ElementContent[]),
  );

  return result;
};
