import { flushPromises, mount } from '@vue/test-utils';

import type { MaskedTextProps } from '../type';

import MaskedText from '../index.uvue';

const PROPS: MaskedTextProps = {
  text: 'word',
  textStyle: { fontSize: '16px', lineHeight: '24px', color: '#202123' },
  maskText: 'word next',
  trailingText: ' next',
};

const installMeasurements = () => {
  const measure = vi.fn(async (id: string) => ({
    width: id.endsWith('-text') ? 32 : 72,
    height: 24,
  }));

  vi.stubGlobal('uni', {
    getWindowInfo: () => ({ pixelRatio: 3 }),
    getElementById: (id: string) => ({ getBoundingClientRectAsync: () => measure(id) }),
  });

  return measure;
};

test.each(['W', 'i'])('measures isolated %s without changing its source text', async (text) => {
  installMeasurements();

  const props = { ...PROPS, text, maskText: text, trailingText: '' };

  const wrapper = mount(MaskedText, { props });

  await flushPromises();

  const measured = wrapper.findAll('text[id]');

  expect(measured).toHaveLength(3);

  expect(measured.map((node) => node.element.textContent)).toEqual(Array(3).fill(`${text}\u200b`));

  expect(wrapper.find('.fluxdown-masked-text__band text').element.textContent).toBe(
    `${text}\u200b`,
  );

  expect(wrapper.props('text')).toBe(text);

  expect(wrapper.props('maskText')).toBe(text);

  expect(wrapper.props('trailingText')).toBe('');

  expect(props).toEqual({ ...PROPS, text, maskText: text, trailingText: '' });
});

test('retains the same native text when the active word becomes opaque', async () => {
  installMeasurements();

  const wrapper = mount(MaskedText, { props: PROPS });

  const placeholder = wrapper.find('text').element;

  await flushPromises();

  expect(wrapper.findAll('.fluxdown-masked-text__band').length).toBeGreaterThan(0);

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 0');

  await wrapper.setProps({ maskText: '' });

  expect(wrapper.find('text').element).toBe(placeholder);

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 1');

  expect(wrapper.find('.fluxdown-masked-text__mask').exists()).toBe(false);

  expect(wrapper.find('.fluxdown-masked-text__measurement').exists()).toBe(false);
});

test('discards obsolete layout results and does not restore a completed mask', async () => {
  const measure = installMeasurements();

  let resolveFirst: (value: { width: number; height: number }) => void;

  measure.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
  );

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  await wrapper.setProps({ text: 'words', maskText: 'words next' });

  await flushPromises();

  const count = wrapper.findAll('.fluxdown-masked-text__band').length;

  expect(count).toBeGreaterThan(0);

  resolveFirst!({ width: 240, height: 80 });

  await flushPromises();

  expect(wrapper.findAll('.fluxdown-masked-text__band')).toHaveLength(count);

  expect(wrapper.find('.fluxdown-masked-text__band').attributes('style')).toContain('height: 24px');

  let resolveNext: (value: { width: number; height: number }) => void;

  measure.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveNext = resolve;
      }),
  );

  await wrapper.setProps({ maskText: 's next' });

  await flushPromises();

  await wrapper.setProps({ maskText: '' });

  resolveNext!({ width: 240, height: 80 });

  await flushPromises();

  expect(wrapper.find('.fluxdown-masked-text__mask').exists()).toBe(false);

  expect(wrapper.find('text').attributes('style')).toContain('opacity: 1');
});

test('remeasures font geometry but not color or opacity changes', async () => {
  const measure = installMeasurements();

  const wrapper = mount(MaskedText, { props: PROPS });

  await flushPromises();

  expect(measure).toHaveBeenCalledTimes(3);

  await wrapper.setProps({ textStyle: { ...PROPS.textStyle, color: '#ffffff', opacity: 0.5 } });

  await flushPromises();

  expect(measure).toHaveBeenCalledTimes(3);

  await wrapper.setProps({ textStyle: { ...PROPS.textStyle, fontWeight: '700' } });

  await flushPromises();

  expect(measure).toHaveBeenCalledTimes(6);

  expect(wrapper.find('.fluxdown-masked-text__measurement').attributes('style')).toContain(
    'width: 288px',
  );
});
