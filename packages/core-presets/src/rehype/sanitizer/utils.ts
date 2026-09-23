import type { Element, Root } from 'hast';
import type { Schema as SanitizationSchema } from 'hast-util-sanitize';

import { defaultsBy } from '@fluxdown/utils';
import { concat, isArray, uniq } from 'lodash-es';
import { defaultSchema } from 'rehype-sanitize';

export interface CreateSchemaParams {
  allowedTags?: string[] | boolean;

  allowedProtocols?: string[];

  fallback?: SanitizationSchema;
}

const DEFAULT_ALLOWED_TAGS = ['u', 'br', 'a', 'span', 'em'];

const DEFAULT_ALLOWED_ATTRS = [
  'dataParserPatch',
  'dataPatchKey',
  'dataPatchText',
  'dataType',
  'style',
  'className',
];

export const createSchema = ({
  allowedTags,
  allowedProtocols,
  fallback,
}: CreateSchemaParams): SanitizationSchema => {
  const extraTags = isArray(allowedTags) ? allowedTags : [];

  const initialSchema = fallback ?? defaultSchema;

  const spanAttrs = uniq([...(initialSchema.attributes?.span ?? []), ...DEFAULT_ALLOWED_ATTRS]);

  const hrefProtocols = uniq(concat(initialSchema.protocols?.href ?? [], allowedProtocols ?? []));

  const srcProtocols = uniq(concat(initialSchema.protocols?.src ?? [], ['data']));

  const aAttrs = uniq([...(initialSchema.attributes?.a ?? []), 'href', 'title']);

  const codeAttrs = uniq([...(initialSchema.attributes?.code ?? []), 'dataMeta']);

  const tagNames = uniq(concat(initialSchema.tagNames ?? [], DEFAULT_ALLOWED_TAGS, extraTags));

  const attributes = defaultsBy(
    {
      span: spanAttrs,
      a: aAttrs,
      code: codeAttrs,
    },
    initialSchema.attributes ?? {},
  );

  const protocols = defaultsBy(
    {
      href: hrefProtocols,
      src: srcProtocols,
    },
    initialSchema.protocols ?? {},
  );

  return defaultsBy<SanitizationSchema>({ tagNames, attributes, protocols }, initialSchema);
};

/** Keep generated footnote links aligned with IDs without disabling clobber protection. */
export const restoreFootnoteLinks = (tree: Root, schema: SanitizationSchema) => {
  if (!schema.clobber?.includes('id') || !schema.clobberPrefix) {
    return;
  }

  if (
    !tree.children.some(
      (node) => node.type === 'element' && Object.hasOwn(node.properties, 'dataFootnotes'),
    )
  ) {
    return;
  }

  const ids: string[] = [];

  const links: Element[] = [];

  const nodes = [...tree.children];

  while (nodes.length > 0) {
    const node = nodes.pop();

    if (node?.type !== 'element') {
      continue;
    }

    if (typeof node.properties.id === 'string') {
      ids.push(node.properties.id);
    }

    if (
      Object.hasOwn(node.properties, 'dataFootnoteRef') ||
      Object.hasOwn(node.properties, 'dataFootnoteBackref')
    ) {
      links.push(node);
    }

    nodes.push(...node.children);
  }

  for (const link of links) {
    const href = link.properties.href;

    if (typeof href === 'string' && href.startsWith('#')) {
      const target = `${schema.clobberPrefix}${href.slice(1)}`;

      if (ids.includes(target)) {
        link.properties.href = `#${target}`;
      }
    }
  }
};
