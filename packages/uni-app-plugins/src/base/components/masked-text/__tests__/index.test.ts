import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, reactive } from 'vue';

import type { MaskedTextProps, TextSize } from '../type';

import { MaskedText } from '..';
import { useMask } from '../hooks';

const paint = vi.hoisted(() => ({ pending: undefined as Promise<void> | undefined }));

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>();

  return {
    ...actual,
    nextTick: (callback?: () => void) => paint.pending ?? actual.nextTick(callback),
  };
});

const PROPS: MaskedTextProps = {
  text: 'word',
  textStyle: { fontSize: '16px', lineHeight: '24px', color: '#202123' },
  maskText: 'rd',
  trailingText: '',
};

const installMeasurements = () => {
  const measure = vi.fn(
    async (id: string): Promise<TextSize> => ({
      width: id.endsWith('-mask') ? 16 : 32,
      height: 24,
    }),
  );

  const elements: Record<string, { getBoundingClientRectAsync: () => Promise<TextSize> }> = {};

  const getElementById = vi.fn(
    (id: string): { getBoundingClientRectAsync: () => Promise<TextSize> } | null =>
      (elements[id] ??= { getBoundingClientRectAsync: () => measure(id) }),
  );

  vi.stubGlobal('uni', {
    getWindowInfo: () => ({ pixelRatio: 3 }),
    getElementById,
  });

  return { measure, getElementById };
};

const notify = (index: number, width: number, height = 24) => {
  const observer = vi.mocked(UniResizeObserver);

  const callback = observer.mock.calls[index]![0];

  callback(
    [
      {
        target: {},
        borderBoxSize: [{ inlineSize: width, blockSize: height }],
      } as UniResizeObserverEntry,
    ],
    observer.mock.results[index]!.value,
  );
};

const createModel = () => {
  const props = reactive({ ...PROPS });

  let mask!: ReturnType<typeof useMask>;

  const wrapper = mount(
    defineComponent({
      setup() {
        mask = useMask(props);

        return () => null;
      },
    }),
  );

  return { props, wrapper, mask };
};

const deferPaint = () => {
  let finish!: () => void;

  paint.pending = new Promise<void>((resolve) => {
    finish = resolve;
  });

  return () => {
    paint.pending = undefined;

    finish();
  };
};

afterEach(() => {
  paint.pending = undefined;
});

test('seeds an opaque comma when the observers do not deliver an initial notification', async () => {
  const { measure } = installMeasurements();

  measure.mockImplementation(async (id) => ({
    width: id.endsWith('-mask') ? 0 : 16,
    height: 24,
  }));

  const wrapper = mount(MaskedText, {
    props: { ...PROPS, text: '，', maskText: '', tail: false },
  });

  await flushPromises();

  expect(measure).toHaveBeenCalledTimes(3);

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width).toBe(
    '16px',
  );

  expect(wrapper.get('.fluxdown-masked-text__prefix text').element.textContent).toBe('，\u200b');

  expect(wrapper.find('.fluxdown-masked-text__active').exists()).toBe(false);

  expect(wrapper.findAll('.fluxdown-masked-text__measurement text')).toHaveLength(3);
});

test('keeps the initial word hidden and ignores late seed results after unmounting', async () => {
  const { measure } = installMeasurements();

  const resolve: ((size: TextSize) => void)[] = [];

  measure.mockImplementation(() => new Promise((finish) => resolve.push(finish)));

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  const prefix = wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element;

  expect(prefix.style.width).toBe('0px');

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__placeholder').element.style.opacity).toBe(
    '0',
  );

  expect(wrapper.find('.fluxdown-masked-text__active').exists()).toBe(false);

  wrapper.unmount();

  resolve.forEach((finish) => finish({ width: 80, height: 24 }));

  await flushPromises();

  expect(prefix.style.width).toBe('0px');

  expect(
    vi
      .mocked(UniResizeObserver)
      .mock.results.every(({ value }) => vi.mocked(value.disconnect).mock.calls.length === 1),
  ).toBe(true);
});

test('associates anonymous observer targets by closure and keeps their values over late seeds', async () => {
  const { measure } = installMeasurements();

  const resolve: ((size: TextSize) => void)[] = [];

  measure.mockImplementation(() => new Promise((finish) => resolve.push(finish)));

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  notify(0, 40);

  notify(1, 8);

  notify(2, 40);

  await flushPromises();

  const prefix = wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element;

  const active = wrapper.get<HTMLElement>('.fluxdown-masked-text__active').element;

  expect(prefix.style.width).toBe('32px');

  expect(active.style.width).toBe('8px');

  resolve.forEach((finish) => finish({ width: 240, height: 80 }));

  await flushPromises();

  expect(prefix.style.width).toBe('32px');

  expect(active.style.width).toBe('8px');

  notify(0, 240, 0);

  await flushPromises();

  expect(prefix.style.width).toBe('32px');

  await wrapper.setProps({ text: 'new', maskText: 'w' });

  notify(0, 24);

  notify(1, 8);

  notify(2, 24);

  await flushPromises();

  expect(prefix.style.width).toBe('16px');
});

test('retries zero-height initial layouts on the same hosts and cancels a retired retry', async () => {
  const { measure, getElementById } = installMeasurements();

  const frames: FrameRequestCallback[] = [];

  const cancelFrame = vi.fn();

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));

  vi.stubGlobal('cancelAnimationFrame', cancelFrame);

  measure.mockResolvedValue({ width: 0, height: 0 });

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  const helpers = wrapper.findAll('.fluxdown-masked-text__measurement text');

  const ids = helpers.map((node) => node.attributes('id'));

  expect(frames).toHaveLength(1);

  measure.mockImplementation(async (id) => ({
    width: id.endsWith('-mask') ? 16 : 32,
    height: 24,
  }));

  frames[0]!(16);

  await flushPromises();

  expect(wrapper.findAll('.fluxdown-masked-text__band')).toHaveLength(16);

  expect(
    wrapper.findAll('.fluxdown-masked-text__measurement text').map((node) => node.element),
  ).toEqual(helpers.map((node) => node.element));

  expect(measure.mock.calls.map(([id]) => id)).toEqual([...ids, ...ids]);

  expect(getElementById).toHaveBeenCalledTimes(3);

  wrapper.unmount();

  getElementById.mockReturnValue(null);

  const pending = mount(MaskedText, { props: PROPS });

  await flushPromises();

  expect(frames).toHaveLength(2);

  pending.unmount();

  expect(cancelFrame).toHaveBeenCalledWith(2);

  const calls = getElementById.mock.calls.length;

  frames[1]!(32);

  await flushPromises();

  expect(getElementById).toHaveBeenCalledTimes(calls);
});

test('retains one prefix text through masking, opacity and resume without multiplying alpha twice', async () => {
  installMeasurements();

  const wrapper = mount(MaskedText, {
    props: { ...PROPS, textStyle: { ...PROPS.textStyle, opacity: 0.6 } },
  });

  const prefix = wrapper.get('.fluxdown-masked-text__prefix').element;

  const text = wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix text').element;

  await flushPromises();

  const firstBand = wrapper.get<HTMLElement>('.fluxdown-masked-text__band').element;

  expect(text.style.opacity).toBe('0.6');

  expect(Number(firstBand.style.opacity)).toBeCloseTo((15.5 / 16) * 0.6);

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__band text').element.style.opacity).toBe(
    '1',
  );

  expect(text.style.whiteSpace).toBe('nowrap');

  await wrapper.setProps({ maskText: '' });

  await flushPromises();

  expect(wrapper.get('.fluxdown-masked-text__prefix').element).toBe(prefix);

  expect(wrapper.get('.fluxdown-masked-text__prefix text').element).toBe(text);

  expect(wrapper.find('.fluxdown-masked-text__active').exists()).toBe(false);

  await wrapper.setProps({ text: 'words', maskText: 's' });

  await flushPromises();

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width).toBe(
    '32px',
  );

  notify(0, 40);

  notify(1, 8);

  notify(2, 40);

  await flushPromises();

  expect(wrapper.get('.fluxdown-masked-text__prefix').element).toBe(prefix);

  expect(wrapper.get('.fluxdown-masked-text__prefix text').element).toBe(text);

  expect(text.textContent).toBe('words\u200b');

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width).toBe(
    '32px',
  );

  expect(wrapper.findAll('.fluxdown-masked-text__band')).toHaveLength(8);
});

test('updates font geometry through observers without recreating measurement hosts or reseeding', async () => {
  const { measure } = installMeasurements();

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  const helpers = wrapper
    .findAll('.fluxdown-masked-text__measurement text')
    .map((node) => node.element);

  await wrapper.setProps({ textStyle: { ...PROPS.textStyle, color: '#ffffff', opacity: 0.5 } });

  await wrapper.setProps({
    textStyle: { ...PROPS.textStyle, fontSize: '32px', fontStyle: 'italic' },
  });

  notify(0, 64, 48);

  notify(1, 32, 48);

  notify(2, 64, 48);

  await flushPromises();

  expect(measure).toHaveBeenCalledTimes(3);

  expect(
    wrapper.findAll('.fluxdown-masked-text__measurement text').map((node) => node.element),
  ).toEqual(helpers);

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width).toBe(
    '40px',
  );

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__drawing').element.style.height).toBe(
    '48px',
  );

  await wrapper.setProps({ maskText: '' });

  await flushPromises();

  await wrapper.setProps({ maskText: 'rd', textStyle: PROPS.textStyle });

  notify(0, 32);

  notify(1, 16);

  notify(2, 32);

  await flushPromises();

  expect(wrapper.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width).toBe(
    '16px',
  );
});

test('grows the active pool only as needed and retires the whole zero-width window after paint', async () => {
  installMeasurements();

  const { props, wrapper, mask } = createModel();

  await flushPromises();

  notify(1, 32);

  await flushPromises();

  expect(mask.bandCount.value).toBe(32);

  notify(1, 8);

  await flushPromises();

  expect(mask.bandCount.value).toBe(32);

  expect(mask.frame.value.activeWidth).toBe(8);

  const finish = deferPaint();

  props.maskText = '';

  await flushPromises();

  expect(mask.frame.value.activeWidth).toBe(0);

  expect(mask.drawing.value).toBe(true);

  expect(mask.bandCount.value).toBe(32);

  finish();

  await flushPromises();

  expect(mask.drawing.value).toBe(false);

  expect(mask.bandCount.value).toBe(0);

  props.text = 'words';

  props.maskText = 's';

  notify(0, 40);

  notify(2, 40);

  await flushPromises();

  expect(mask.drawing.value).toBe(true);

  expect(mask.bandCount.value).toBe(8);

  wrapper.unmount();
});

test.each(['resume', 'unmount'])(
  'does not retire a fresh active window after a late paint and %s',
  async (change) => {
    installMeasurements();

    const { props, wrapper, mask } = createModel();

    await flushPromises();

    const finish = deferPaint();

    props.maskText = '';

    await flushPromises();

    if (change === 'resume') {
      props.text = 'words';

      props.maskText = 's';

      notify(0, 40);

      notify(1, 8);

      notify(2, 40);

      await flushPromises();
    } else {
      wrapper.unmount();
    }

    const count = mask.bandCount.value;

    finish();

    await flushPromises();

    expect(mask.drawing.value).toBe(true);

    expect(mask.bandCount.value).toBe(count);

    if (change === 'resume') {
      expect(mask.frame.value.activeWidth).toBe(8);

      wrapper.unmount();
    }
  },
);

test('does not register queued observations after unmounting before the first microtask', async () => {
  const { getElementById } = installMeasurements();

  const wrapper = mount(MaskedText, { props: PROPS });

  wrapper.unmount();

  await flushPromises();

  expect(getElementById).not.toHaveBeenCalled();

  expect(
    vi
      .mocked(UniResizeObserver)
      .mock.results.every(({ value }) => vi.mocked(value.observe).mock.calls.length === 0),
  ).toBe(true);
});
