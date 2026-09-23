import type { Token } from 'marked';

import { last } from 'lodash-es';

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const VOID_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const RAW_TEXT_TAGS = [
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
  'script',
  'style',
  'textarea',
  'title',
  'xmp',
];

/** Track HTML containers across Markdown blocks without inspecting code or escaped text. */
export const trackHtmlContainers = (token: Token, containers: string[]): void => {
  if (token.type !== 'html') {
    if ((token.type === 'paragraph' || token.type === 'text') && token.tokens) {
      token.tokens.forEach((child) => trackHtmlContainers(child, containers));
    }

    return;
  }

  const tags = token.raw.matchAll(
    /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<\?[\s\S]*?(?:\?>|$)|<![^>]*(?:>|$)|<\/?([A-Za-z][\w:-]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*>/g,
  );

  for (const match of tags) {
    const tag = match[1]?.toLowerCase();

    if (!tag) {
      continue;
    }

    const closing = match[0].startsWith('</');

    const current = last(containers);

    if (current && RAW_TEXT_TAGS.includes(current) && (!closing || tag !== current)) {
      continue;
    }

    if (closing) {
      const index = containers.lastIndexOf(tag);

      if (index >= 0) {
        containers.length = index;
      }
    } else if (!VOID_TAGS.includes(tag)) {
      containers.push(tag);
    }
  }
};
