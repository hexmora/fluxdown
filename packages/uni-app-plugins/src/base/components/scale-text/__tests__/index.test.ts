import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { ScaleText } from '..';

test('finishes on the same native text and restores its foreground without changing shadow geometry', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const frames: FrameRequestCallback[] = [];

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: async () => ({ width: 128, height: 24 }),
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 'S',
      textStyle: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '700',
        color: 'rgba(20, 40, 60, 0.4)',
        opacity: 0.6,
      },
      start: 1000,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  const placeholder = wrapper.find('text').element;

  const visibility = wrapper.get<HTMLElement>('.fluxdown-scale-text__placeholder');

  expect(wrapper.find('.fluxdown-scale-text__animation').attributes('style')).toContain(
    'scale(0.875)',
  );

  expect(visibility.attributes('style')).toContain('opacity: 0');

  expect(placeholder.style.opacity).toBe('0.6');

  expect(wrapper.find('canvas').exists()).toBe(false);

  const readPlaceholderStyle = () =>
    Object.fromEntries(
      Array.from(placeholder.style, (name) => [name, placeholder.style.getPropertyValue(name)]),
    );

  const placeholderStyle = readPlaceholderStyle();

  const animation = wrapper.find('.fluxdown-scale-text__animation').element;

  const shadow = wrapper.get<HTMLElement>('.fluxdown-scale-text__clip text').element;

  const shadowOffset = shadow.style.textShadow.split(' ')[0];

  expect(shadow.style.left).toBe('-44px');

  expect(shadow.style.color).toBe('rgb(0, 0, 0)');

  expect(shadow.style.textShadow).toContain('rgba(20, 40, 60, 0.4)');

  now.mockReturnValue(1150);

  frames.at(-1)!(1150);

  await nextTick();

  expect(wrapper.find('.fluxdown-scale-text__animation').element).toBe(animation);

  expect(wrapper.find('.fluxdown-scale-text__animation').attributes('style')).toContain(
    'scale(0.984375)',
  );

  expect(wrapper.find('text').element).toBe(placeholder);

  expect(readPlaceholderStyle()).toEqual(placeholderStyle);

  now.mockReturnValue(1200);

  frames.at(-1)!(1200);

  await nextTick();

  expect(wrapper.get<HTMLElement>('.fluxdown-scale-text__animation').element).toBe(animation);

  expect(wrapper.get<HTMLElement>('.fluxdown-scale-text__clip text').element).toBe(shadow);

  expect(shadow.style.left).toBe('12px');

  expect(shadow.style.color).toBe('rgba(20, 40, 60, 0.4)');

  expect(shadow.style.textShadow.split(' ')[0]).toBe(shadowOffset);

  expect(wrapper.find('text').element).toBe(placeholder);

  expect(wrapper.get<HTMLElement>('.fluxdown-scale-text__placeholder').element).toBe(
    visibility.element,
  );

  expect(visibility.attributes('style')).toContain('opacity: 0');

  expect(readPlaceholderStyle()).toEqual(placeholderStyle);

  expect(wrapper.find('text').attributes('style')).toContain('font-weight: 700');

  wrapper.unmount();
});

test('observes fractional advances while keeping its measurement and visible text hosts', async () => {
  let finish: (value: { width: number; height: number }) => void;

  const getRect = vi.fn(
    () =>
      new Promise<{ width: number; height: number }>((resolve) => {
        finish = resolve;
      }),
  );

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: getRect,
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 't',
      textStyle: { fontSize: '16px', lineHeight: '24px', letterSpacing: '0.5px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  const measured = wrapper.get<HTMLElement>('.fluxdown-scale-text__measurement text');

  const visible = wrapper.find('text').element;

  expect(measured.text()).toBe('t\u200b'.repeat(16));

  expect(measured.element.style.fontSize).toBe('16px');

  expect(measured.element.style.lineHeight).toBe('24px');

  finish!({ width: 71, height: 24 });

  await flushPromises();

  expect(wrapper.element.style.width).toBe('4.9375px');

  await wrapper.setProps({
    text: 'm',
    textStyle: { fontSize: '24px', lineHeight: '36px', letterSpacing: '0.5px', color: 'red' },
  });

  expect(wrapper.element.style.width).toBe('4.9375px');

  expect(wrapper.get('.fluxdown-scale-text__measurement text').element).toBe(measured.element);

  expect(measured.element.style.fontSize).toBe('24px');

  const constructor = vi.mocked(UniResizeObserver);

  constructor.mock.calls[0]![0](
    [{ borderBoxSize: [{ inlineSize: 214, blockSize: 36 }] }] as UniResizeObserverEntry[],
    constructor.mock.results[0]!.value as UniResizeObserver,
  );

  await flushPromises();

  expect(wrapper.element.style.width).toBe('13.875px');

  expect(wrapper.find('text').element).toBe(visible);

  await wrapper.setProps({
    textStyle: { fontSize: '24px', lineHeight: '36px', letterSpacing: '0.5px', color: 'blue' },
  });

  expect(getRect).toHaveBeenCalledTimes(1);

  wrapper.unmount();
});

test('does not replace a newer observer width with a late initial seed', async () => {
  let finish: (value: { width: number; height: number }) => void;

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: () =>
      new Promise<{ width: number; height: number }>((resolve) => {
        finish = resolve;
      }),
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 'W',
      textStyle: { fontSize: '16px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  const constructor = vi.mocked(UniResizeObserver);

  constructor.mock.calls[0]![0](
    [{ borderBoxSize: [{ inlineSize: 248, blockSize: 24 }] }] as UniResizeObserverEntry[],
    constructor.mock.results[0]!.value as UniResizeObserver,
  );

  await flushPromises();

  expect(wrapper.element.style.width).toBe('15.5px');

  finish!({ width: 128, height: 24 });

  await flushPromises();

  expect(wrapper.element.style.width).toBe('15.5px');

  wrapper.unmount();
});

test('retries only its initial layout and accepts zero width with positive height', async () => {
  const frames: FrameRequestCallback[] = [];

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  const getRect = vi.fn(async () => ({ width: 0, height: 0 }));

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: getRect,
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: '\u200b',
      textStyle: { fontSize: '16px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  const helper = wrapper.get('.fluxdown-scale-text__measurement text').element;

  expect(frames).toHaveLength(1);

  getRect.mockResolvedValue({ width: 0, height: 24 });

  frames[0](16);

  await flushPromises();

  expect(wrapper.element.style.width).toBe('0px');

  expect(wrapper.get('.fluxdown-scale-text__measurement text').element).toBe(helper);

  const constructor = vi.mocked(UniResizeObserver);

  const observer = vi.mocked(constructor.mock.results[0]!.value as UniResizeObserver);

  expect(observer.observe).toHaveBeenCalledTimes(1);

  await wrapper.setProps({ text: 'W' });

  constructor.mock.calls[0]![0](
    [{ borderBoxSize: [{ inlineSize: 248, blockSize: 24 }] }] as UniResizeObserverEntry[],
    observer,
  );

  await flushPromises();

  expect(wrapper.element.style.width).toBe('15.5px');

  expect(getRect).toHaveBeenCalledTimes(2);

  wrapper.unmount();

  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test('cancels an unfinished initial layout when its glyph is removed', async () => {
  const request = vi.fn(() => 7);

  const cancel = vi.fn();

  vi.stubGlobal('requestAnimationFrame', request);

  vi.stubGlobal('cancelAnimationFrame', cancel);

  const getRect = vi.fn(async () => ({ width: 0, height: 0 }));

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: getRect,
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 'W',
      textStyle: { fontSize: '16px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  expect(request).toHaveBeenCalledTimes(1);

  const observer = vi.mocked(
    vi.mocked(UniResizeObserver).mock.results[0]!.value as UniResizeObserver,
  );

  wrapper.unmount();

  expect(cancel).toHaveBeenCalledWith(7);

  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test('keeps every glyph layer on one line inside a fractional character advance', async () => {
  vi.spyOn(performance, 'now').mockReturnValue(1100);

  vi.stubGlobal('requestAnimationFrame', vi.fn());

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: async () => ({ width: 71, height: 24 }),
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 't',
      textStyle: { fontSize: '16px', lineHeight: '24px', whiteSpace: 'normal' },
      start: 1000,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  expect(wrapper.attributes('style')).toContain('width: 4.4375px');

  const placeholder = wrapper.find('text').element;

  expect(wrapper.findAll('text')).toHaveLength(3);

  expect(wrapper.find('.fluxdown-scale-text__measurement').exists()).toBe(true);

  for (const text of wrapper.findAll('text')) {
    expect(text.element.style.whiteSpace).toBe('nowrap');

    expect(text.text()).toBe(
      text.element.closest('.fluxdown-scale-text__measurement') ? 't\u200b'.repeat(16) : 't\u200b',
    );
  }

  await wrapper.setProps({ start: -1 });

  expect(wrapper.find('text').element).toBe(placeholder);

  expect(placeholder.style.whiteSpace).toBe('nowrap');

  expect(wrapper.find('.fluxdown-scale-text__animation').exists()).toBe(true);

  wrapper.unmount();
});

test('ignores a measurement result after its glyph is removed', async () => {
  let finish: (value: { width: number; height: number }) => void;

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: () =>
      new Promise<{ width: number; height: number }>((resolve) => {
        finish = resolve;
      }),
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text: 'W',
      textStyle: { fontSize: '16px', lineHeight: '24px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  const root = wrapper.element;

  wrapper.unmount();

  finish!({ width: 248, height: 24 });

  await flushPromises();

  expect(root.style.width).toBe('');
});

test.each([
  ['e\u0301', 1],
  ['👨‍👩‍👧‍👦', 1],
  ['word', 4],
] as const)('measures tracking for %s by complete graphemes', async (text, units) => {
  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: async () => ({ width: 320, height: 24 }),
  } as unknown as UniElement);

  const wrapper = mount(ScaleText, {
    props: {
      text,
      textStyle: { fontSize: '16px', letterSpacing: '0.5px' },
      start: -1,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  await flushPromises();

  expect(wrapper.element.style.width).toBe(`${20 + units * 0.5}px`);

  expect(wrapper.find('text').text()).toBe(`${text}\u200b`);
});
