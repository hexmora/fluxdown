import type { Element, ElementContent, Root as HastRoot, RootContent } from 'hast';

import { isHiddenTagName } from '@fluxdown/hast';

import type { SuffixType } from './type';

export const SUFFIX_TAG_NAME = 'span';

export const SUFFIX_DATA_ATTR = 'dataFluxdownSuffix';

export type SuffixNode = Element & {
  properties: Element['properties'] & { dataFluxdownSuffix: SuffixType };
};

export const isSuffixNode = (node: RootContent): node is SuffixNode =>
  node.type === 'element' &&
  node.tagName === SUFFIX_TAG_NAME &&
  typeof node.properties[SUFFIX_DATA_ATTR] === 'string';

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const containers = [
  'address',
  'article',
  'aside',
  'caption',
  'dd',
  'details',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'header',
  'main',
  'nav',
  'section',
  'summary',
  'p',
  'li',
  'td',
  'th',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'div',
  'blockquote',
  'pre',
];

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const opaque = ['math', 'svg', 'annotation'];

const getTailPath = (parent: HastRoot | Element): number[] | null => {
  for (let index = parent.children.length - 1; index >= 0; index -= 1) {
    const child = parent.children[index];

    if (!child) {
      continue;
    }

    if (child.type === 'text') {
      if (child.value.trim().length > 0) {
        return [index];
      }

      continue;
    }

    if (child.type !== 'element' || isHiddenTagName(child.tagName) || isSuffixNode(child)) {
      continue;
    }

    const isOpaque =
      opaque.includes(child.tagName) ||
      child.properties.dataType === 'inline-math' ||
      child.properties.dataType === 'block-math' ||
      child.properties.dataParserPatch === '1';

    const tail = isOpaque ? null : getTailPath(child);

    return tail ? [index, ...tail] : [index];
  }

  return null;
};

/** Append outside inline formatting and effect wrappers, but inside the final block. */
export const createSuffixRoot = (root: HastRoot, type: SuffixType): HastRoot => {
  const tail = getTailPath(root);

  if (!tail) {
    return root;
  }

  let target: HastRoot | Element = root;
  let current: HastRoot | Element = root;
  let depth = 0;

  for (let index = 0; index < tail.length; index += 1) {
    const child: RootContent | undefined = current.children[tail[index] ?? -1];

    if (child?.type !== 'element') {
      break;
    }

    if (
      containers.includes(child.tagName) ||
      (child.tagName === 'code' && current.type === 'element' && current.tagName === 'pre')
    ) {
      target = child;
      depth = index + 1;
    }

    current = child;
  }

  const marker: Element = {
    type: 'element',
    tagName: SUFFIX_TAG_NAME,
    properties: { [SUFFIX_DATA_ATTR]: type },
    // An empty element counts as an atomic visible unit. An empty text child keeps
    // this decoration at length zero when composed with Smooth or another mapper.
    children: [{ type: 'text', value: '' }],
  };

  const children = [...target.children];

  if (target.type === 'element' && target.tagName === 'code') {
    const last = children[children.length - 1];

    // remark-rehype appends one newline to fenced code; the Code renderer strips
    // that newline too, so the marker belongs before it in headless output.
    if (last?.type === 'text' && /\r?\n$/.test(last.value)) {
      const ending = /\r?\n$/.exec(last.value)?.[0] ?? '\n';

      children.splice(
        children.length - 1,
        1,
        { ...last, value: last.value.slice(0, -ending.length) },
        marker,
        { type: 'text', value: ending },
      );
    } else {
      children.push(marker);
    }
  } else {
    const lastIndex = tail[depth];

    children.splice(lastIndex === undefined ? children.length : lastIndex + 1, 0, marker);
  }

  const replace = (parent: HastRoot | Element, index: number): HastRoot | Element => {
    if (index === depth) {
      return { ...parent, children: children as ElementContent[] };
    }

    const childIndex = tail[index] ?? -1;
    const child = parent.children[childIndex];

    if (child?.type !== 'element') {
      return parent;
    }

    const next = [...parent.children];

    next[childIndex] = replace(child, index + 1) as Element;

    return { ...parent, children: next as ElementContent[] };
  };

  return replace(root, 0) as HastRoot;
};
