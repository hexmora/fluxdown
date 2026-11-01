import { mount } from '@vue/test-utils';

import type { UniTextNode } from '../../../../typings/render';

import { InlineText } from '..';
import { MaskedText } from '../../masked-text';
import { ScaleText } from '../../scale-text';

test.each(['scale', 'chunk', 'shad'] as const)(
  'keeps the same visible effect tree when %s becomes ordinary text',
  async (type) => {
    const effect =
      type === 'shad'
        ? { type, maskText: 'word next', trailingText: ' next' }
        : { type, start: -1, duration: 200, from: 0, blur: 0.08 };

    const parts: UniTextNode[] = [{ text: 'word ', effect }];

    const wrapper = mount(InlineText, {
      props: { parts },
      attrs: { style: { opacity: 0.6 } },
    });

    const word = wrapper.get<HTMLElement>('.fluxdown-inline-text');

    const text = word.find('text');

    const visibility = word.get<HTMLElement>('.fluxdown-inline-text__placeholder');

    expect(visibility.attributes('style')).toContain('opacity: 0');

    expect(text.element.style.opacity).toBe('0.6');

    await wrapper.setProps({ parts: [{ text: 'word ' }] });

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text').element).toBe(word.element);

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text').find('text').element).toBe(
      text.element,
    );

    expect(text.element.textContent).toBe('word\u00a0\u200b');

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__placeholder').element).toBe(
      visibility.element,
    );

    expect(visibility.attributes('style')).toContain('opacity: 0');

    expect(text.element.style.opacity).toBe('0.6');

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element.style.opacity).toBe(
      '',
    );
  },
);

test('does not create an effect layer for words that have never animated', async () => {
  const wrapper = mount(InlineText, { props: { parts: [{ text: 'static' }] } });

  expect(wrapper.find('.fluxdown-inline-text__effect').exists()).toBe(false);

  await wrapper.setProps({ parts: [{ text: 'static text' }] });

  expect(wrapper.find('.fluxdown-inline-text__effect').exists()).toBe(false);
});

test.each(['scale', 'chunk', 'shad'] as const)(
  'reuses the %s effect layer and child components when the same word resumes',
  async (type) => {
    const effect =
      type === 'shad'
        ? { type, maskText: 'sa', trailingText: '' }
        : { type, start: -1, duration: 200, from: 0, blur: 0.08 };

    const wrapper = mount(InlineText, { props: { parts: [{ text: 'sa', effect }] } });

    const Component = type === 'shad' ? MaskedText : ScaleText;

    const children = () =>
      wrapper.findAllComponents(Component).filter((child) => child.vm.$.type === Component);

    const instances = children().map((child) => child.vm.$);

    const elements = children().map((child) => child.find('text').element);

    const layer = wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element;

    await wrapper.setProps({ parts: [{ text: 'sa' }] });

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element).toBe(layer);

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element.style.opacity).toBe(
      '',
    );

    expect(children().map((child) => child.vm.$)).toEqual(instances);

    expect(children().map((child) => child.find('text').element)).toEqual(elements);

    await wrapper.setProps({ parts: [{ text: 'sa' }, { text: 'm', effect }] });

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element).toBe(layer);

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element.style.opacity).toBe(
      '',
    );

    expect(
      children()
        .slice(0, instances.length)
        .map((child) => child.vm.$),
    ).toEqual(instances);

    expect(
      children()
        .slice(0, elements.length)
        .map((child) => child.find('text').element),
    ).toEqual(elements);
  },
);

test.each(['scale', 'chunk', 'shad'] as const)(
  'retains a completed %s drawing when its word closes',
  async (type) => {
    const effect =
      type === 'shad'
        ? { type, maskText: 'word', trailingText: '' }
        : { type, start: -1, duration: 200, from: 0, blur: 0.08 };

    const wrapper = mount(InlineText, {
      props: { parts: [{ text: 'word', effect }], tail: true },
    });

    const layer = wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element;

    const text = wrapper.find('text').element;

    await wrapper.setProps({ tail: false });

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element).toBe(layer);

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element.style.opacity).toBe(
      '',
    );

    await wrapper.setProps({ parts: [{ text: 'word' }] });

    expect(wrapper.get<HTMLElement>('.fluxdown-inline-text__effect').element).toBe(layer);

    expect(wrapper.find('text').element).toBe(text);
  },
);

test('passes a closed tail to the retained mask without replacing its drawing', async () => {
  const effect = { type: 'shad' as const, maskText: 'word', trailingText: '' };

  const wrapper = mount(InlineText, { props: { parts: [{ text: 'word', effect }] } });

  await wrapper.setProps({ parts: [{ text: 'word' }] });

  expect(wrapper.find('.fluxdown-inline-text__effect').exists()).toBe(true);

  const instance = wrapper.getComponent(MaskedText).vm.$;

  await wrapper.setProps({ tail: false });

  expect(wrapper.getComponent(MaskedText).vm.$).toBe(instance);

  expect(wrapper.getComponent(MaskedText).props('tail')).toBe(false);

  expect(wrapper.find('.fluxdown-inline-text__effect').exists()).toBe(true);
});

test('retains completed glyphs when scale merges them into the ordinary prefix', async () => {
  const scale = { type: 'scale' as const, start: -1, duration: 200, from: 0, blur: 0.08 };

  const wrapper = mount(InlineText, {
    props: { parts: [{ text: 'ba' }, { text: 'se', effect: scale }] },
  });

  const glyphs = wrapper.findAllComponents(ScaleText);

  const instances = glyphs.map((glyph) => glyph.vm.$);

  const elements = glyphs.map((glyph) => glyph.find('text').element);

  await wrapper.setProps({ parts: [{ text: 'bas' }, { text: 'e', effect: scale }] });

  const next = wrapper.findAllComponents(ScaleText);

  expect(next.map((glyph) => glyph.vm.$)).toEqual(instances);

  expect(next.map((glyph) => glyph.find('text').element)).toEqual(elements);

  expect(next.map((glyph) => glyph.props('text'))).toEqual(['b', 'a', 's', 'e']);
});

test('retains grapheme identity across adjacent chunk batches without smoothing', async () => {
  const chunk = { type: 'chunk' as const, start: -1, duration: 200 };

  const wrapper = mount(InlineText, {
    props: { parts: [{ text: 'e\u0301👨‍👩‍👧‍👦', effect: chunk }] },
  });

  const instances = wrapper.findAllComponents(ScaleText).map((glyph) => glyph.vm.$);

  await wrapper.setProps({
    parts: [{ text: 'e\u0301👨‍👩‍👧‍👦' }, { text: '文', effect: chunk }],
  });

  const next = wrapper.findAllComponents(ScaleText);

  expect(next.slice(0, 2).map((glyph) => glyph.vm.$)).toEqual(instances);

  expect(next.map((glyph) => glyph.props('text'))).toEqual(['e\u0301', '👨‍👩‍👧‍👦', '文']);
});

test('keeps the whole-word placeholder on one line', () => {
  const wrapper = mount(InlineText, {
    props: { parts: [{ text: 'word ' }] },
    attrs: { style: { whiteSpace: 'normal' } },
  });

  const text = wrapper.get<HTMLElement>('.fluxdown-inline-text__placeholder text');

  expect(text.element.style.whiteSpace).toBe('nowrap');

  expect(text.text()).toBe('word\u00a0\u200b');
});

test('retains a long word placeholder across a pause, resumed output and completion', async () => {
  const effect = { type: 'shad' as const, maskText: 'supercali', trailingText: '' };

  const wrapper = mount(InlineText, {
    props: { parts: [{ text: 'supercali', effect }] },
  });

  const placeholder = wrapper.get('.fluxdown-inline-text__placeholder text').element;

  await wrapper.setProps({ parts: [{ text: 'supercalifragilistic', effect }] });

  expect(placeholder.textContent).toBe('supercalifragilistic\u200b');

  await wrapper.setProps({ parts: [{ text: 'supercalifragilistic' }] });

  expect(wrapper.get('.fluxdown-inline-text__placeholder text').element).toBe(placeholder);

  await wrapper.setProps({
    parts: [{ text: 'supercalifragilistic' }, { text: 'expialidocious ', effect }],
  });

  expect(placeholder.textContent).toBe('supercalifragilisticexpialidocious\u00a0\u200b');

  await wrapper.setProps({
    parts: [{ text: 'supercalifragilisticexpialidocious ' }],
    tail: false,
  });

  expect(wrapper.get('.fluxdown-inline-text__placeholder text').element).toBe(placeholder);

  expect(placeholder.textContent).toBe('supercalifragilisticexpialidocious\u00a0\u200b');
});
