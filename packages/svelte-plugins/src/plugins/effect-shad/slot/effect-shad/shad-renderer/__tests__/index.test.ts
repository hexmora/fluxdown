import type { Element } from 'hast';

import { cleanup, render } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';

import { ShadRenderer } from '..';
import { getShadConfig } from '../../../../render/effect-shad/utils';

afterEach(cleanup);

test.each([
  { maskWidth: undefined, expected: 15 },
  { maskWidth: '24.5', expected: 24.5 },
  { maskWidth: 'invalid', expected: 15 },
  { maskWidth: Infinity, expected: 15 },
  { maskWidth: -10, expected: 0 },
  { maskWidth: 0, expected: 0 },
])('renders maskWidth=$maskWidth without changing inline text', ({ maskWidth, expected }) => {
  const node: Element = {
    type: 'element',
    tagName: 'span',
    properties: { dataShadMaskWidth: maskWidth },
    children: [],
  };

  const view = render(ShadRenderer, {
    ...getShadConfig(node),
    leading: 'leading',
    active: 'active',
    isActive: true,
  });

  const mask = view.container.querySelector('.mask') as HTMLElement;

  expect(view.container.textContent).toBe('leadingactive');

  expect(mask.style.width).toBe(`${expected}px`);

  expect(mask.style.marginLeft).toBe(`${-expected}px`);

  expect(view.container.firstElementChild?.hasAttribute('style')).toBe(false);
});

test('retains the leading and active spans when the tail changes or settles', async () => {
  const view = render(ShadRenderer, {
    leading: 'a',
    active: 'bc',
    isActive: true,
    maskWidth: 15,
  });

  const leading = view.container.querySelector('.leading');

  const active = view.container.querySelector('.active');

  const mask = view.container.querySelector('.mask');

  await view.rerender({ leading: 'ab', active: 'cd' });

  expect(view.container.querySelector('.leading')).toBe(leading);

  expect(view.container.querySelector('.active')).toBe(active);

  expect(view.container.textContent).toBe('abcd');

  await view.rerender({ leading: 'abcd', active: '', isActive: false });

  expect(view.container.querySelector('.mask-hidden')).toBe(mask);

  expect(view.container.textContent).toBe('abcd');
});
