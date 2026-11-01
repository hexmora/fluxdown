import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

import { EASE_IN_OUT, EASE_OUT } from '../easing';
import { useAppear, useBreathe } from '../hooks';

interface HarnessProps {
  start: number;

  duration: number;
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    const progress = useAppear(() => ({ start: props.start, duration: props.duration }));

    return () => h('text', String(progress.value));
  },
  { props: ['start', 'duration'] },
);

afterEach(() => {
  vi.unstubAllGlobals();
});

test('matches CSS ease-out and ease-in-out, including exact endpoints', () => {
  expect(EASE_OUT(0)).toBe(0);

  expect(EASE_OUT(1)).toBe(1);

  expect(EASE_OUT(0.5)).toBeCloseTo(0.68464, 4);

  expect(EASE_IN_OUT(0.5)).toBeCloseTo(0.5, 4);
});

test('resumes the core timestamp and cancels animation when replaced or unmounted', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(150);

  const request = vi.fn((_callback: FrameRequestCallback) => 1);

  const cancel = vi.fn();

  vi.stubGlobal('requestAnimationFrame', request);

  vi.stubGlobal('cancelAnimationFrame', cancel);

  const wrapper = mount(Harness, { props: { start: 100, duration: 200 } });

  expect(wrapper.text()).toBe('0.25');

  now.mockReturnValue(200);

  const callback = request.mock.calls[0][0];

  callback(200);

  await nextTick();

  expect(wrapper.text()).toBe('0.5');

  await wrapper.setProps({ start: -1 });

  expect(wrapper.text()).toBe('1');

  expect(cancel).toHaveBeenCalledWith(1);

  wrapper.unmount();
});

test('animates chunk and suffix with the native clock when performance is unavailable', async () => {
  vi.stubGlobal('performance', undefined);

  const now = vi.spyOn(Date, 'now').mockReturnValue(1200);

  const request = vi.fn((_callback: FrameRequestCallback) => 1);

  vi.stubGlobal('requestAnimationFrame', request);

  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  const chunk = mount(Harness, { props: { start: 1000, duration: 400 } });

  expect(chunk.text()).toBe('0.5');

  const Suffix = defineComponent({
    setup() {
      const opacity = useBreathe();

      return () => h('text', String(opacity.value));
    },
  });

  const suffix = mount(Suffix);

  const frame = request.mock.calls.at(-1)![0];

  now.mockReturnValue(1600);

  frame(1600);

  await nextTick();

  expect(Number(suffix.text())).toBeCloseTo(1 - EASE_IN_OUT(0.4));
});
