import type { Plugin } from 'unified';

import type { HastRoot } from '../../../typings';

/** Encode namespaces without whitespace, URI escapes, or collisions between input strings. */
export const getFootnotePrefix = (namespace?: string): string =>
  namespace
    ? `${Array.from(namespace, (character) => character.codePointAt(0)!.toString(16)).join('-')}-`
    : '';

/** remark-rehype namespaces references and definitions, but keeps the label ID constant. */
export const namespaceFootnoteLabel: Plugin<[string], HastRoot, HastRoot> = (prefix) => (tree) => {
  const section = tree.children.find(
    (node) => node.type === 'element' && Object.hasOwn(node.properties, 'dataFootnotes'),
  );

  if (section?.type !== 'element') {
    return;
  }

  const label = section.children.find(
    (node) => node.type === 'element' && node.properties.id === 'footnote-label',
  );

  if (label?.type === 'element') {
    label.properties.id = `${prefix}footnote-label`;
  }

  const nodes = [...tree.children];

  while (nodes.length > 0) {
    const node = nodes.pop();

    if (node?.type !== 'element') {
      continue;
    }

    if (Object.hasOwn(node.properties, 'dataFootnoteRef')) {
      node.properties.ariaDescribedBy = [`${prefix}footnote-label`];
    }

    nodes.push(...node.children);
  }
};
