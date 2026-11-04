import type { MainThread } from '@lynx-js/types';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { shallowRef } from 'vue';
import * as runtime from 'vue-lynx';

import { AnimatedText } from '..';
import { ChunkRenderer } from '../../../../plugins/effect-chunk/slot/effect-chunk/renderer';
import { ScaleRenderer } from '../../../../plugins/effect-scale/slot/effect-scale/renderer';
import { TextAnimationProvider } from '../../../context';

const refs: { current: unknown }[] = [];

const cancel = vi.fn();

const animate = vi.fn(() => ({ cancel }));

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

  cancel.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('static text and inactive effects never dispatch worklets without attached native refs', async () => {
  const dispatch = vi.spyOn(runtime, 'runOnMainThread');

  const text = mount(AnimatedText, { props: { children: 'static' } });

  const chunk = mount(ChunkRenderer, { props: { start: -1, duration: 200, children: 'chunk' } });

  const scale = mount(ScaleRenderer, {
    props: { start: -1, duration: 200, from: 0.2, blur: 0.08, children: 'scale' },
  });

  await flushPromises();

  expect(dispatch).not.toHaveBeenCalled();

  text.unmount();

  chunk.unmount();

  scale.unmount();

  expect(dispatch).not.toHaveBeenCalled();
});

test('initially static text can animate and cancel when its animation context changes', async () => {
  const animation = shallowRef<{ arrival: number; duration: number } | null>(null);

  const view = mount(() => (
    <TextAnimationProvider value={animation.value}>
      <AnimatedText style={{ color: '#202123' }}>A</AnimatedText>
    </TextAnimationProvider>
  ));

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).not.toHaveBeenCalled();

  animation.value = { arrival: 1900, duration: 200 };

  await flushPromises();

  expect(animate).toHaveBeenCalledOnce();

  animation.value = null;

  await flushPromises();

  expect(cancel).toHaveBeenCalledOnce();

  view.unmount();
});

test('resumes color keyframes with the React Lynx delay and cancels them on disposal', async () => {
  const view = mount(() => (
    <TextAnimationProvider value={{ arrival: 1900, duration: 200 }}>
      <AnimatedText style={{ color: '#202123' }}>Words with spaces</AnimatedText>
    </TextAnimationProvider>
  ));

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).toHaveBeenCalledWith([{ color: 'transparent' }, { color: '#202123' }], {
    duration: 200,
    delay: -100,
    easing: 'cubic-bezier(0, 0, 0.58, 1)',
    fill: 'both',
  });

  expect(view.find('text').text()).toBe('Words with spaces');

  expect(view.find('view').exists()).toBe(false);

  view.unmount();

  expect(cancel).toHaveBeenCalledOnce();
});

test('chunk keeps inline text geometry and does not restart its original batch on updates', async () => {
  const view = mount(ChunkRenderer, {
    props: { start: 1000, duration: 200, children: 'A' },
  });

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).toHaveBeenCalledOnce();

  expect(view.find('.fluxdown-chunk').element.tagName.toLowerCase()).toBe('text');

  expect(view.find('.fluxdown-chunk-active').exists()).toBe(true);

  await view.setProps({ children: 'AB' });

  await flushPromises();

  expect(animate).toHaveBeenCalledOnce();

  expect(view.text()).toBe('AB');

  await view.setProps({ start: -1 });

  await flushPromises();

  expect(view.find('.fluxdown-chunk-active').exists()).toBe(false);
});

test('scale preserves the native appearance and growth keyframes', async () => {
  const view = mount(ScaleRenderer, {
    props: { start: 1000, duration: 200, from: 0.2, blur: 0.08, children: 'A' },
  });

  refs[0]!.current = element;

  refs[2]!.current = element;

  await flushPromises();

  expect(animate).toHaveBeenCalledTimes(2);

  const [appearance, growth] = animate.mock.calls as unknown as [
    [Record<string, unknown>[], Record<string, unknown>],
    [Record<string, unknown>[], Record<string, unknown>],
  ];

  expect(appearance[0]).toHaveLength(11);

  expect(appearance[0][0]).toEqual({ offset: 0, opacity: 0, filter: 'blur(1.28px)' });

  expect(appearance[0][5]).toEqual({ offset: 0.5, opacity: 0.765625, filter: 'blur(0.905097px)' });

  expect(appearance[0][10]).toEqual({ offset: 1, opacity: 1, filter: 'blur(0px)' });

  expect(appearance[1]).toEqual({ duration: 200, delay: -100, easing: 'linear', fill: 'both' });

  expect(growth[0]).toEqual([{ transform: 'scale(0.2)' }, { transform: 'scale(1)' }]);

  expect(growth[1]).toEqual({
    duration: 200,
    delay: -100,
    easing: 'cubic-bezier(0.333333, 1, 0.666667, 1)',
    fill: 'both',
  });

  await view.setProps({ children: 'AB' });

  await flushPromises();

  expect(animate).toHaveBeenCalledTimes(2);

  expect(view.find('.fluxdown-scale-glyph').text()).toBe('AB');
});

test('scale preserves its handles for color updates and its timeline for new keyframes', async () => {
  const view = mount(ScaleRenderer, {
    props: {
      start: 1000,
      duration: 200,
      from: 0.2,
      blur: 0.08,
      children: 'A',
      style: { color: '#202123', fontSize: '16px' },
    },
  });

  refs[0]!.current = element;

  refs[2]!.current = element;

  await flushPromises();

  expect(animate).toHaveBeenCalledTimes(2);

  await view.setProps({ style: { color: '#f9fafb', fontSize: '16px' } });

  await flushPromises();

  expect(animate).toHaveBeenCalledTimes(2);

  expect(cancel).not.toHaveBeenCalled();

  vi.mocked(Date.now).mockReturnValue(2050);

  await view.setProps({ from: 0.3 });

  await flushPromises();

  expect(animate).toHaveBeenCalledTimes(3);

  expect(animate).toHaveBeenLastCalledWith(
    [{ transform: 'scale(0.3)' }, { transform: 'scale(1)' }],
    {
      duration: 200,
      delay: -150,
      easing: 'cubic-bezier(0.333333, 1, 0.666667, 1)',
      fill: 'both',
    },
  );

  view.unmount();
});

test('settled batches and reduced motion do not start native animations', async () => {
  const settled = mount(ChunkRenderer, {
    props: { start: 800, duration: 200, children: 'settled' },
  });

  refs[0]!.current = element;

  await flushPromises();

  expect(animate).not.toHaveBeenCalled();

  settled.unmount();

  refs.length = 0;

  mount(ChunkRenderer, { props: { start: 1000, duration: 200, children: 'reduced' } });

  refs[0]!.current = { ...element, getComputedStyleProperty: () => 'paused' };

  await flushPromises();

  expect(animate).not.toHaveBeenCalled();
});
