import type { Element } from 'hast';

import { expect, test } from 'vitest';

import { getSvelteProps, isSafeTagName } from '../hast';

const element = (properties: Element['properties']): Element => ({
  type: 'element',
  tagName: 'p',
  properties,
  children: [],
});

test('normalizes HAST attributes while excluding executable properties', () => {
  expect(
    getSvelteProps(
      element({
        className: ['first', 'second'],
        dataCustomValue: 'safe',
        ariaLabel: 'description',
        onclick: 'alert(1)',
        style: 'color: red; --custom: url("data:image/svg+xml;a");',
      }),
    ),
  ).toEqual({
    class: 'first second',
    'data-custom-value': 'safe',
    'aria-label': 'description',
    style: 'color: red; --custom: url("data:image/svg+xml;a")',
  });
});

test('permits safe elements and excludes executable host tags', () => {
  expect(isSafeTagName('mark')).toBe(true);

  expect(isSafeTagName('custom-element')).toBe(true);

  expect(isSafeTagName('script')).toBe(false);

  expect(isSafeTagName('iframe')).toBe(false);
});
