/* eslint-disable no-await-in-loop -- Each streamed update must settle before checking component identity. */

import type { UniRenderNode } from '@fluxdown/uni-app-plugins/typings';
import type { Element, Root } from 'hast';

import { getUniProps, InlineFlow, provideSlots, RenderNodes } from '@fluxdown/uni-app-plugins/base';
import {
  EffectShadRenderPlugin,
  EffectShadSlotPlugin,
} from '@fluxdown/uni-app-plugins/plugins/effect-shad';
import {
  EmphasisRenderPlugin,
  EmphasisSlotPlugin,
} from '@fluxdown/uni-app-plugins/plugins/emphasis';
import { FallbackRenderPlugin } from '@fluxdown/uni-app-plugins/plugins/fallback';
import { StrongSlotPlugin } from '@fluxdown/uni-app-plugins/plugins/strong';
import { flushPromises, mount } from '@vue/test-utils';
import { toState } from 'stative';
import { defineComponent, h } from 'vue';

import { createShadRoot } from '../../../core-plugins/src/plugins/mapper/shad/utils';
import { renderParentChildren } from '../components/block-reconciler/utils';
import { FluxdownLite } from '../packs/lite';
import { getText } from './utils/text';

interface HarnessProps {
  nodes: UniRenderNode[];
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    provideSlots(() => [EmphasisSlotPlugin, EffectShadSlotPlugin]);

    return () => h(InlineFlow, null, { default: () => h(RenderNodes, { nodes: props.nodes }) });
  },
  { props: ['nodes'] },
);

const renderRoot = (root: Root) => {
  return renderParentChildren(
    root,
    [root],
    toState([]),
    [new FallbackRenderPlugin(), new EmphasisRenderPlugin(), new EffectShadRenderPlugin()],
    getUniProps,
  );
};

test('retains one emphasized word when core shad partitions and releases its source element', async () => {
  const emphasis: Element = {
    type: 'element',
    tagName: 'em',
    properties: {},
    children: [{ type: 'text', value: 'italic' }],
    position: {
      start: { line: 1, column: 8, offset: 7 },
      end: { line: 1, column: 16, offset: 15 },
    },
  };

  const source: Root = {
    type: 'root',
    children: [{ type: 'text', value: 'before ' }, emphasis],
  };

  const mapped = (activeLength: number) =>
    renderRoot(createShadRoot({ root: source, length: 6, activeLength }));

  const wrapper = mount(Harness, { props: { nodes: mapped(1) } });

  await flushPromises();

  const Component = new EmphasisSlotPlugin().Component;

  expect(wrapper.findAllComponents(Component)).toHaveLength(1);

  const styled = wrapper.getComponent(Component);

  const instance = styled.vm.$;

  const word = styled.get('.fluxdown-inline-text').element;

  expect(styled.findAll('.fluxdown-inline-text')).toHaveLength(1);

  for (const nodes of [mapped(3), mapped(6), renderRoot(source)]) {
    await wrapper.setProps({ nodes });

    expect(wrapper.findAllComponents(Component)).toHaveLength(1);

    const next = wrapper.getComponent(Component);

    expect(next.vm.$).toBe(instance);

    expect(next.get('.fluxdown-inline-text').element).toBe(word);

    expect(next.findAll('.fluxdown-inline-text')).toHaveLength(1);
  }

  expect(emphasis.children).toEqual([{ type: 'text', value: 'italic' }]);
});

test('keeps the strong component and bold word while streamed closing markers arrive', async () => {
  const text = 'Stable **bold text** and *jiffy italic*';

  const prefix = 'Stable **bold';

  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

  const wrapper = mount(FluxdownLite, {
    props: { text: '', streaming: { smooth: false, effect: 'shad' } },
  });

  await flushPromises();

  for (let length = 1; length <= prefix.length; length += 1) {
    now.mockReturnValue(1000 + length * 60);

    await wrapper.setProps({ text: text.slice(0, length) });
  }

  const Component = new StrongSlotPlugin().Component;

  const strong = wrapper.getComponent(Component);

  const instance = strong.vm.$;

  const word = strong.get('.fluxdown-inline-text').element;

  expect(getText(word)).toBe('bold');

  for (let length = prefix.length + 1; length <= text.length; length += 1) {
    now.mockReturnValue(1000 + length * 60);

    await wrapper.setProps({ text: text.slice(0, length) });

    const components = wrapper
      .findAllComponents(Component)
      .filter((component) => component.vm.$.type === Component);

    expect(components, `source: ${text.slice(0, length)}`).toHaveLength(1);

    const next = components[0];

    expect(next.vm.$).toBe(instance);

    expect(next.get('.fluxdown-inline-text').element).toBe(word);

    expect(getText(word).trim()).toBe('bold');
  }
});

test('bounds historical block masks while preserving every native word drawing', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: async () => ({ width: 32, height: 24 }),
  } as unknown as UniElement);

  const wrapper = mount(FluxdownLite, {
    props: { text: 'fir', streaming: { smooth: false, effect: 'shad' } },
  });

  await flushPromises();

  await wrapper.setProps({ text: 'first' });

  await flushPromises();

  const first = wrapper.get('.fluxdown-masked-text').element;

  const prefix = wrapper.get('.fluxdown-masked-text__prefix text').element;

  vi.advanceTimersByTime(201);

  await flushPromises();

  expect(wrapper.get('.fluxdown-masked-text').element).toBe(first);

  await wrapper.setProps({ text: 'firsts' });

  await flushPromises();

  expect(wrapper.get('.fluxdown-masked-text').element).toBe(first);

  for (const [index, text] of ['firsts\n\nsecond', 'firsts\n\nsecond\n\nthird'].entries()) {
    await wrapper.setProps({ text });

    await flushPromises();

    vi.advanceTimersByTime(201);

    await flushPromises();

    const masks = wrapper.findAll('.fluxdown-masked-text');

    expect(masks).toHaveLength(index + 2);

    expect(masks[0].element).toBe(first);

    expect(masks[0].get('.fluxdown-masked-text__prefix text').element).toBe(prefix);

    expect(masks.every((mask) => !mask.find('.fluxdown-masked-text__active').exists())).toBe(true);

    expect(
      masks.every(
        (mask) =>
          mask.get<HTMLElement>('.fluxdown-masked-text__prefix').element.style.width === '32px',
      ),
    ).toBe(true);

    expect(getText(wrapper.element)).toBe(text.replaceAll('\n', ''));
  }
});

test('retires a closed styled window without replacing its opaque prefix', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  vi.spyOn(uni, 'getElementById').mockReturnValue({
    getBoundingClientRectAsync: async () => ({ width: 32, height: 24 }),
  } as unknown as UniElement);

  const wrapper = mount(FluxdownLite, {
    props: { text: '**bo', streaming: { smooth: false, effect: 'shad' } },
  });

  await flushPromises();

  await wrapper.setProps({ text: '**bold**' });

  await flushPromises();

  const Component = new StrongSlotPlugin().Component;

  const strong = wrapper.getComponent(Component);

  const instance = strong.vm.$;

  const prefix = strong.get('.fluxdown-masked-text__prefix text').element;

  expect(strong.find('.fluxdown-masked-text').exists()).toBe(true);

  vi.advanceTimersByTime(201);

  await flushPromises();

  expect(strong.find('.fluxdown-masked-text').exists()).toBe(true);

  await wrapper.setProps({ text: '**bold** next' });

  await flushPromises();

  vi.advanceTimersByTime(201);

  await flushPromises();

  expect(wrapper.getComponent(Component).vm.$).toBe(instance);

  expect(strong.find('.fluxdown-masked-text').exists()).toBe(true);

  expect(strong.get('.fluxdown-masked-text__prefix text').element).toBe(prefix);

  expect(strong.find('.fluxdown-masked-text__active').exists()).toBe(false);

  const masks = wrapper.findAll('.fluxdown-masked-text');

  expect(masks.every((mask) => !mask.find('.fluxdown-masked-text__active').exists())).toBe(true);

  expect(getText(wrapper.element)).toBe('bold next');
});

test.each([
  {
    name: 'list',
    selector: '.fluxdown-list',
    before: '- fir',
    active: '- first',
    next: '- first\n- next',
  },
  {
    name: 'table',
    selector: '.fluxdown-table',
    before: '| Name |\n| --- |\n| fir |',
    active: '| Name |\n| --- |\n| first |',
    next: '| Name |\n| --- |\n| first |\n| next |',
  },
])(
  'retires a completed $name window while retaining its prefix when a new block begins',
  async ({ selector, before, active, next }) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    vi.spyOn(uni, 'getElementById').mockReturnValue({
      getBoundingClientRectAsync: async () => ({ width: 32, height: 24 }),
    } as unknown as UniElement);

    const wrapper = mount(FluxdownLite, {
      props: { text: before, streaming: { smooth: false, effect: 'shad' } },
    });

    await flushPromises();

    await wrapper.setProps({ text: active });

    await flushPromises();

    expect(wrapper.find(`${selector} .fluxdown-masked-text`).exists()).toBe(true);

    const prefix = wrapper.get(`${selector} .fluxdown-masked-text__prefix text`).element;

    await wrapper.setProps({ text: next });

    await flushPromises();

    vi.advanceTimersByTime(201);

    await flushPromises();

    const masks = wrapper.findAll(`${selector} .fluxdown-masked-text`);

    expect(masks).toHaveLength(2);

    expect(masks[0].get('.fluxdown-masked-text__prefix text').element).toBe(prefix);

    expect(masks.every((mask) => !mask.find('.fluxdown-masked-text__active').exists())).toBe(true);

    expect(masks.map((mask) => mask.get('.fluxdown-masked-text__prefix text').text())).toEqual([
      'first\u200b',
      'next\u200b',
    ]);

    await wrapper.setProps({ text: `${next}\n\nafter` });

    await flushPromises();

    vi.advanceTimersByTime(201);

    await flushPromises();

    expect(wrapper.findAll(`${selector} .fluxdown-masked-text`)).toHaveLength(2);

    expect(wrapper.get(`${selector} .fluxdown-masked-text__prefix text`).element).toBe(prefix);

    expect(wrapper.find(`${selector} .fluxdown-masked-text__active`).exists()).toBe(false);

    expect(wrapper.findAll('.fluxdown-masked-text')).toHaveLength(3);
  },
);
