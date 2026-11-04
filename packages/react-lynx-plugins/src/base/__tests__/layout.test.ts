import type { Element, Root } from 'hast';

import { expect, test } from '@rstest/core';

import { getBlockStyle } from '../render/layout';
import { getLynxProps } from '../render/props';
import { normalizePublicUrl } from '../slot/utils/url';
import { resolveTheme } from '../theme';
import { LIGHT_THEME } from '../theme/presets/light';

const element = (tagName: string): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children: [],
});

test('collapses adjacent blocks across independently reconciled parser roots', () => {
  const paragraph = element('p');

  const heading = element('h1');

  const previous: Root = { type: 'root', children: [paragraph] };

  const current: Root = { type: 'root', children: [heading] };

  expect(
    getBlockStyle(paragraph, [previous], LIGHT_THEME.tokens, { first: true, last: false }),
  ).toEqual({ marginTop: '0px', marginBottom: '16px' });

  expect(
    getBlockStyle(heading, [current], LIGHT_THEME.tokens, { first: false, last: false, previous }),
  ).toEqual({ marginTop: '16px', marginBottom: '16px' });

  expect(
    getBlockStyle(heading, [current], LIGHT_THEME.tokens, { first: false, last: true, previous }),
  ).toEqual({ marginTop: '16px', marginBottom: '0px' });
});

test('trims only the first and last children inside a quote', () => {
  const first = element('p');

  const second = element('p');

  const quote = { ...element('blockquote'), children: [first, second] };

  expect(getBlockStyle(first, [quote], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '16px',
  });

  expect(getBlockStyle(second, [quote], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '0px',
  });
});

test('loose list paragraphs collapse to eight pixels while nested lists use four', () => {
  const first = element('p');

  const second = element('p');

  const nested = element('ul');

  const item: Element = { ...element('li'), children: [first, second, nested] };

  expect(getBlockStyle(first, [item], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '8px',
  });

  expect(getBlockStyle(second, [item], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '8px',
  });

  expect(getBlockStyle(nested, [item], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '0px',
  });

  const tight: Element = {
    ...element('li'),
    children: [{ type: 'text', value: 'parent' }, nested],
  };

  expect(getBlockStyle(nested, [tight], LIGHT_THEME.tokens)).toEqual({
    marginTop: '4px',
    marginBottom: '0px',
  });

  const next = { ...element('li'), children: [element('p')] };

  const list = { ...element('ul'), children: [item, next] };

  expect(getBlockStyle(next, [list], LIGHT_THEME.tokens)).toEqual({ marginTop: '4px' });

  const quote = { ...element('blockquote'), children: [first, list] };

  expect(getBlockStyle(list, [quote], LIGHT_THEME.tokens)).toEqual({
    marginTop: '0px',
    marginBottom: '4px',
  });
});

test('theme overrides are scoped to their instance', () => {
  const dark = resolveTheme([
    'dark',
    { tokens: { colors: { accent: '#123456' }, paragraph: { marginBottom: '20px' } } },
  ]);

  expect(dark.tokens.colors.accent).toBe('#123456');

  expect(dark.tokens.colors.bg).toBe('#212121');

  expect(dark.tokens.paragraph.marginBottom).toBe('20px');

  expect(resolveTheme('dark').tokens.colors.accent).toBe('#82b7ff');

  expect(LIGHT_THEME.tokens.paragraph.marginBottom).toBe('16px');
});

test('HAST event handlers and browser-only attributes never become native props', () => {
  const node = {
    ...element('a'),
    properties: {
      id: 'note',
      className: ['link', 'active'],
      href: 'https://example.com',
      onClick: 'danger()',
      style: 'display:block',
      checked: true,
      width: 32,
    },
  };

  expect(getLynxProps(node)).toEqual({
    id: 'note',
    className: 'link active',
    checked: true,
    width: 32,
  });

  expect(normalizePublicUrl('javascript:alert(1)')).toBeUndefined();

  expect(normalizePublicUrl('java\nscript:alert(1)')).toBeUndefined();

  expect(normalizePublicUrl('https://example.com/note')).toBe('https://example.com/note');

  expect(normalizePublicUrl('#note', { allowHash: true })).toBe('#note');

  expect(normalizePublicUrl('mailto:hello@example.com', { allowMailto: true })).toBe(
    'mailto:hello@example.com',
  );
});
