import type { MainThread } from '@lynx-js/types';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import * as runtime from 'vue-lynx';

import { ShadRenderer } from '..';

const refs: { current: unknown }[] = [];

const animate = vi.fn(() => ({ cancel: vi.fn() }));

const element = { animate, getComputedStyleProperty: () => '' } as unknown as MainThread.Element;

beforeEach(() => {
  refs.length = 0;

  vi.spyOn(runtime, 'useMainThreadRef').mockImplementation((current) => {
    const ref = { current };

    refs.push(ref);

    return ref as ReturnType<typeof runtime.useMainThreadRef>;
  });

  vi.spyOn(Date, 'now').mockReturnValue(2000);

  vi.spyOn(performance, 'now').mockReturnValue(1100);

  animate.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('resumes a linear color fade from its own start time', async () => {
  const view = mount(ShadRenderer, {
    props: { start: 1000, duration: 400, children: 'fade', style: { color: '#202123' } },
  });

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).toHaveBeenCalledWith([{ color: 'transparent' }, { color: '#202123' }], {
    duration: 400,
    delay: -100,
    easing: 'linear',
    fill: 'both',
  });

  expect(view.find('.fluxdown-shad-active').text()).toBe('fade');

  await view.setProps({ children: 'faded' });

  await flushPromises();

  expect(animate).toHaveBeenCalledOnce();
});

test('does not animate content that was already settled', async () => {
  const view = mount(ShadRenderer, {
    props: { start: -1, duration: 400, children: 'fade', style: { color: '#202123' } },
  });

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).not.toHaveBeenCalled();

  expect(view.find('.fluxdown-shad').exists()).toBe(true);

  expect(view.find('.fluxdown-shad-active').exists()).toBe(false);
});
