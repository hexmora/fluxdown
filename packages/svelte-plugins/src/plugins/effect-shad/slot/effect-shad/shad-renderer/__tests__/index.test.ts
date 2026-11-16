import type { Element } from 'hast';

import { SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '@fluxdown/core-plugins/plugins/mapper/shad';
import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { ShadRenderer } from '..';
import { getShadConfig, isShadNode } from '../../../../render/effect-shad/utils';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();
});

const children = createRawSnippet(() => ({ render: () => '<span>fade</span>' }));

const fade = (properties: Element['properties']): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { [SHAD_DATA_ATTR]: SHAD_FADE_VALUE, ...properties },
  children: [{ type: 'text', value: 'fade' }],
});

test('matches only fade spans', () => {
  expect(isShadNode(fade({}))).toBe(true);

  expect(isShadNode({ ...fade({}), tagName: 'div' })).toBe(false);

  expect(isShadNode(fade({ [SHAD_DATA_ATTR]: 'host' }))).toBe(false);
});

test.each([
  { properties: { dataShadStart: 120, dataShadDuration: 250 }, start: 120, duration: 250 },
  { properties: { dataShadStart: '120', dataShadDuration: '250' }, start: 120, duration: 250 },
  { properties: {}, start: -1, duration: 400 },
  { properties: { dataShadStart: -20, dataShadDuration: -5 }, start: -1, duration: 0 },
  { properties: { dataShadStart: 'x', dataShadDuration: Infinity }, start: -1, duration: 400 },
])('reads start and duration from $properties', ({ properties, start, duration }) => {
  expect(getShadConfig(fade(properties))).toEqual({ start, duration });
});

test('resumes a fade from its own start time and settles once it has finished', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const running = render(ShadRenderer, { children, start: 1000, duration: 400 });

  const element = running.container.querySelector('[data-fluxdown-shad="fade"]') as HTMLElement;

  expect(element.classList.contains('active')).toBe(true);

  expect(element.style.animationDelay).toBe('-100ms');

  expect(element.style.getPropertyValue('--fluxdown-shad-duration')).toBe('400ms');

  expect(element.textContent).toBe('fade');

  running.unmount();

  now.mockReturnValue(1500);

  const settled = render(ShadRenderer, { children, start: 1000, duration: 400 });

  expect(settled.container.querySelector('.active')).toBeNull();
});

test('does not animate content that was already settled', () => {
  const view = render(ShadRenderer, { children, start: -1, duration: 400 });

  expect(view.container.querySelector('.active')).toBeNull();
});
