import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ScaleText from '../index.uvue';

test('continues an existing entrance at its event time and keeps the same native text layout', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const frames: FrameRequestCallback[] = [];

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  const wrapper = mount(ScaleText, {
    props: {
      text: 'S',
      textStyle: { fontSize: '16px', lineHeight: '24px', fontWeight: '700' },
      start: 1000,
      duration: 200,
      from: 0,
      blur: 0.08,
    },
  });

  const placeholder = wrapper.find('text').element;

  expect(wrapper.find('.fluxdown-scale-text__animation').attributes('style')).toContain(
    'scale(0.875)',
  );

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 0');

  expect(wrapper.find('canvas').exists()).toBe(false);

  now.mockReturnValue(1200);

  frames.at(-1)!(1200);

  await nextTick();

  expect(wrapper.find('.fluxdown-scale-text__animation').exists()).toBe(false);

  expect(wrapper.find('text').element).toBe(placeholder);

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 1');

  expect(wrapper.find('text').attributes('style')).toContain('font-weight: 700');

  wrapper.unmount();
});

test('measures fractional character advances without changing the visible font or accepting stale widths', async () => {
  const measurements: ((value: { width: number }) => void)[] = [];

  const getRect = vi.fn(
    () => new Promise<{ width: number }>((resolve) => measurements.push(resolve)),
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

  expect(wrapper.find('.fluxdown-scale-text__measurement text').text()).toBe('t\u200b');

  expect(wrapper.find('text').text()).toBe('t\u200b');

  expect(wrapper.props('text')).toBe('t');

  expect(wrapper.find('text').attributes('style')).toContain('font-size: 16px');

  measurements[0]!({ width: 71 });

  await flushPromises();

  expect(wrapper.attributes('style')).toContain('width: 4.9375px');

  await wrapper.setProps({ textStyle: { fontSize: '24px', color: 'red' } });

  await flushPromises();

  await wrapper.setProps({ text: 'm' });

  await flushPromises();

  measurements[2]!({ width: 214 });

  await flushPromises();

  measurements[1]!({ width: 71 });

  await flushPromises();

  expect(wrapper.attributes('style')).toContain('width: 20.0625px');

  await wrapper.setProps({ textStyle: { fontSize: '24px', color: 'blue' } });

  await flushPromises();

  expect(getRect).toHaveBeenCalledTimes(3);

  wrapper.unmount();
});
