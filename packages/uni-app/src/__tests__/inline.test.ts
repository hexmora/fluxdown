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

import type { ShadCharacter } from '../../../core-plugins/src/plugins/mapper/shad/utils';

import {
  createShadRoot,
  FadeConcurrency,
} from '../../../core-plugins/src/plugins/mapper/shad/utils';
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

test('retains one emphasized word while core shad fades it in across batches', async () => {
  const createSource = (italic: string): { emphasis: Element; root: Root } => {
    const emphasis: Element = {
      type: 'element',
      tagName: 'em',
      properties: {},
      children: [{ type: 'text', value: italic }],
      position: {
        start: { line: 1, column: 8, offset: 7 },
        end: { line: 1, column: 16, offset: 15 },
      },
    };

    return {
      emphasis,
      root: { type: 'root', children: [{ type: 'text', value: 'before ' }, emphasis] },
    };
  };

  const concurrency = new FadeConcurrency();

  let characters: ShadCharacter[] = [];

  const mapped = (italic: string, start: number) => {
    const result = createShadRoot(
      createSource(italic).root,
      characters,
      { initial: false, start, length: 6, duration: 400 },
      concurrency,
    );

    characters = result.characters;

    return renderRoot(result.root);
  };

  const wrapper = mount(Harness, { props: { nodes: mapped('i', 0) } });

  await flushPromises();

  const Component = new EmphasisSlotPlugin().Component;

  expect(wrapper.findAllComponents(Component)).toHaveLength(1);

  const styled = wrapper.getComponent(Component);

  const instance = styled.vm.$;

  const word = styled.get('.fluxdown-inline-text').element;

  expect(styled.findAll('.fluxdown-inline-text')).toHaveLength(1);

  const { emphasis, root } = createSource('italic');

  for (const nodes of [mapped('ita', 100), mapped('italic', 200), renderRoot(root)]) {
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

test.each([
  { name: 'paragraph', before: 'fir', active: 'first', next: 'first\n\nnext' },
  { name: 'list', before: '- fir', active: '- first', next: '- first\n- next' },
  {
    name: 'table',
    before: '| Name |\n| --- |\n| fir |',
    active: '| Name |\n| --- |\n| first |',
    next: '| Name |\n| --- |\n| first |\n| next |',
  },
])(
  'keeps a faded $name word on its native drawing when a new block begins',
  async ({ before, active, next }) => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: before, streaming: { smooth: false, effect: 'shad' } },
    });

    await flushPromises();

    now.mockReturnValue(1100);

    await wrapper.setProps({ text: active });

    await flushPromises();

    const word = wrapper
      .findAll('.fluxdown-inline-text')
      .find((item) => getText(item.element).startsWith('first'))!.element;

    // Long after the fade has finished, the settled word keeps its host and drawing.
    now.mockReturnValue(5000);

    await wrapper.setProps({ text: next });

    await flushPromises();

    const words = wrapper.findAll('.fluxdown-inline-text');

    expect(words.map((item) => item.element)).toContain(word);

    expect(getText(wrapper.element)).toContain('next');
  },
);
