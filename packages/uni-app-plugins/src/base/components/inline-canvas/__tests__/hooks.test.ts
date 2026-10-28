import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import InlineCanvas from '../index.uvue';
import { drawText } from '../utils';

vi.mock('../utils', async (original) => ({
  ...(await original<typeof import('../utils')>()),
  drawText: vi.fn(),
}));

test('creates a fresh canvas after a completed entrance removes its previous surface', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

  const contexts: { canvas: { width: number; height: number } | null }[] = [];

  const frames: FrameRequestCallback[] = [];

  const createCanvasContextAsync = vi.fn(({ success }) => {
    const context = { canvas: { width: 0, height: 0 } };

    contexts.push(context);

    success({
      getContext: () => context,
      requestAnimationFrame: (callback: FrameRequestCallback) => frames.push(callback),
      cancelAnimationFrame: vi.fn(),
    });
  });

  vi.stubGlobal('uni', {
    getWindowInfo: () => ({ pixelRatio: 2 }),
    getElementById: () => ({ getBoundingClientRectAsync: async () => ({ width: 8, height: 24 }) }),
    createCanvasContextAsync,
  });

  const wrapper = mount(InlineCanvas, {
    props: {
      text: 'a',
      textStyle: { fontSize: '16px' },
      start: 1000,
      duration: 400,
      from: 0.6,
      blur: 0.3,
    },
  });

  await flushPromises();

  now.mockReturnValue(1100);

  frames.at(-1)!(1100);

  expect(drawText).toHaveBeenLastCalledWith(
    contexts[0],
    expect.anything(),
    expect.anything(),
    expect.any(Number),
    2,
    0.25,
  );

  now.mockReturnValue(1500);

  frames.at(-1)!(1500);

  await nextTick();

  expect(wrapper.find('canvas').exists()).toBe(false);

  contexts[0].canvas = null;

  await wrapper.setProps({ text: 'b', start: 1500 });

  await flushPromises();

  frames.at(-1)!(1500);

  expect(createCanvasContextAsync).toHaveBeenCalledTimes(2);

  expect(contexts[1]).toHaveProperty('font', 'normal 400 16px sans-serif');

  expect(drawText).toHaveBeenLastCalledWith(
    contexts[1],
    expect.anything(),
    expect.anything(),
    expect.any(Number),
    2,
    0,
  );

  wrapper.unmount();
});

test('waits for current text geometry before drawing updated masks', async () => {
  const frames: FrameRequestCallback[] = [];

  const context = { canvas: { width: 0, height: 0 } };

  let resolveRect: (value: { width: number; height: number }) => void;

  const getBoundingClientRectAsync = vi.fn(async () => ({ width: 8, height: 24 }));

  vi.stubGlobal('uni', {
    getWindowInfo: () => ({ pixelRatio: 1 }),
    getElementById: () => ({ getBoundingClientRectAsync }),
    createCanvasContextAsync: ({ success }: { success: (canvas: unknown) => void }) => {
      success({
        getContext: () => context,
        requestAnimationFrame: (callback: FrameRequestCallback) => frames.push(callback),
        cancelAnimationFrame: vi.fn(),
      });
    },
  });

  const wrapper = mount(InlineCanvas, {
    props: {
      text: 'a',
      textStyle: { fontSize: '16px' },
      start: -1,
      duration: 0,
      from: 1,
      blur: 0,
      maskText: 'ab',
      trailingText: 'b',
    },
  });

  await flushPromises();

  expect(getBoundingClientRectAsync).toHaveBeenCalled();

  expect(frames.length).toBeGreaterThan(0);

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 0');

  const oldFrame = frames.at(-1)!;

  getBoundingClientRectAsync.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveRect = resolve;
      }),
  );

  vi.mocked(drawText).mockClear();

  await wrapper.setProps({ text: 'abc', maskText: 'abcd', trailingText: 'd' });

  await flushPromises();

  oldFrame(0);

  expect(drawText).not.toHaveBeenCalled();

  resolveRect!({ width: 24, height: 24 });

  await flushPromises();

  frames.at(-1)!(0);

  expect(context.canvas.width).toBe(26);

  expect(drawText).toHaveBeenLastCalledWith(
    context,
    expect.objectContaining({ text: 'abc', maskText: 'abcd', trailingText: 'd' }),
    { width: 24, height: 24 },
    1,
    1,
    1,
  );

  wrapper.unmount();
});

test('restores fonts after resize and applies font changes without a size change', async () => {
  let width = 0;

  let height = 0;

  const context = {
    font: '10px sans-serif',
    textBaseline: 'alphabetic',
    canvas: {
      get width() {
        return width;
      },
      set width(value: number) {
        width = value;

        context.font = '10px sans-serif';
      },
      get height() {
        return height;
      },
      set height(value: number) {
        height = value;

        context.textBaseline = 'alphabetic';
      },
    },
  };

  const rect = { width: 8, height: 24 };

  vi.stubGlobal('uni', {
    getWindowInfo: () => ({ pixelRatio: 1 }),
    getElementById: () => ({ getBoundingClientRectAsync: async () => rect }),
    createCanvasContextAsync: ({ success }: { success: (canvas: unknown) => void }) => {
      success({
        getContext: () => context,
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: vi.fn(),
      });
    },
  });

  const wrapper = mount(InlineCanvas, {
    props: {
      text: 'a',
      textStyle: { fontSize: '16px' },
      start: -1,
      duration: 0,
      from: 1,
      blur: 0,
      maskText: 'a',
    },
  });

  await flushPromises();

  expect(context.font).toBe('normal 400 16px sans-serif');

  expect(context.textBaseline).toBe('middle');

  await wrapper.setProps({ textStyle: { fontSize: '16px', fontWeight: '700' } });

  await flushPromises();

  expect(context.font).toBe('normal 700 16px sans-serif');

  rect.width = 10;

  rect.height = 28;

  await wrapper.setProps({ textStyle: { fontSize: '20px', fontWeight: '700' } });

  await flushPromises();

  expect(context.canvas.width).toBe(12);

  expect(context.font).toBe('normal 700 20px sans-serif');

  expect(context.textBaseline).toBe('middle');

  wrapper.unmount();
});
