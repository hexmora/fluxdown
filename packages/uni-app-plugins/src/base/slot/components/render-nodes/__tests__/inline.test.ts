import type { Element } from 'hast';

import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { UniComponentNode, UniRenderNode, UniSlotNode } from '../../../../../typings/render';
import type { InlineTextProps } from '../../../../components/inline-text/type';
import type { Slots } from '../../../type';

import { RenderNodes } from '..';
import { EffectChunkSlotPlugin } from '../../../../../plugins/effect-chunk/slot/effect-chunk';
import { EffectScaleSlotPlugin } from '../../../../../plugins/effect-scale/slot/effect-scale';
import { EffectScaleWordSlotPlugin } from '../../../../../plugins/effect-scale/slot/effect-scale-word';
import { EffectShadSlotPlugin } from '../../../../../plugins/effect-shad/slot/effect-shad';
import { provideInlineFlow } from '../../../../components/inline-flow/context';
import { InlineText } from '../../../../components/inline-text';
import { provideSlots } from '../../../context';
import { createTypeOfSlot } from '../../../utils';
import { normalizeInlineNodes } from '../inline';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

const Chunk = /*#__PURE__*/ createTypeOfSlot('Chunk');

const Shad = /*#__PURE__*/ createTypeOfSlot('Shad');

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

const Strong = /*#__PURE__*/ createTypeOfSlot('Strong');

const SCALE = { start: -1, duration: 200, from: 0, blur: 0.08 };

const createSlots = (): Slots => ({
  Scale: [new EffectScaleSlotPlugin()],
  ScaleWord: [new EffectScaleWordSlotPlugin()],
  Chunk: [new EffectChunkSlotPlugin()],
  Shad: [new EffectShadSlotPlugin()],
});

const wordsOf = (nodes: (UniComponentNode | UniSlotNode)[]) => {
  return nodes.map((node) => (node.props as unknown as InlineTextProps).parts);
};

interface HarnessProps {
  nodes: UniRenderNode[];
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    provideInlineFlow();

    provideSlots(() => [
      EffectScaleSlotPlugin,
      EffectScaleWordSlotPlugin,
      EffectChunkSlotPlugin,
      EffectShadSlotPlugin,
    ]);

    return () => h(RenderNodes, { nodes: props.nodes });
  },
  { props: ['nodes'] },
);

test('keeps scale word keys and native placeholders when core folds completed spans', async () => {
  const nodes = ['one ', ScaleWord({}, [Scale(SCALE, ['t']), Scale(SCALE, ['wo'])])];

  const initial = normalizeInlineNodes(nodes, createSlots());

  const settled = normalizeInlineNodes(['one two'], createSlots());

  expect(initial.map((node) => node.key)).toEqual(['inline:0', 'inline:4']);

  expect(settled.map((node) => node.key)).toEqual(initial.map((node) => node.key));

  const wrapper = mount(Harness, { props: { nodes } });

  await flushPromises();

  const word = wrapper.findAllComponents(InlineText)[1];

  const instance = word.vm.$;

  const placeholder = word.find('text').element;

  await wrapper.setProps({ nodes: ['one two'] });

  const next = wrapper.findAllComponents(InlineText)[1];

  expect(next.vm.$).toBe(instance);

  expect(next.find('text').element).toBe(placeholder);

  expect(next.props('parts')).toEqual([{ text: 'two' }]);
});

test('combines a chunk boundary inside a word without replacing its host', () => {
  const slots = createSlots();

  const active = normalizeInlineNodes(
    ['str', Chunk({ start: 50, duration: 400 }, ['eaming '])],
    slots,
  );

  const settled = normalizeInlineNodes(['streaming '], slots);

  expect(active).toHaveLength(1);

  expect(active[0].key).toBe(settled[0].key);

  expect(wordsOf(active)[0]).toEqual([
    { text: 'str' },
    { text: 'eaming\u00a0', effect: { type: 'chunk', start: 50, duration: 400 } },
  ]);
});

test('keeps distinct cursor keys across appends while preserving explicit suffix keys', () => {
  const slots = createSlots();

  const cursors = [
    { ...Suffix({ type: 'cursor' }), key: '1:element:span' },
    { ...Suffix({ type: 'dot' }), key: '2:element:span' },
  ];

  const keys = (nodes: UniRenderNode[]) =>
    normalizeInlineNodes(nodes, slots)
      .filter((node) => 'type' in node && node.type === 'Suffix')
      .map((node) => node.key);

  const initial = keys(['before ', ...cursors]);

  expect(initial).toHaveLength(2);

  expect(initial[0]).not.toBe(initial[1]);

  expect(keys(['before another batch ', ...cursors])).toEqual(initial);

  for (const key of ['render:custom-cursor', 'user-cursor']) {
    const custom = { ...Suffix({ type: 'cursor' }), key };

    expect(normalizeInlineNodes(['before ', custom], slots).at(-1)).toBe(custom);
  }
});

test('carries each shad batch clock into its own words', () => {
  const result = normalizeInlineNodes(
    ['old ', Shad({ start: 20, duration: 400 }, ['tail ', Strong({}, ['bold'])])],
    createSlots(),
  );

  const shad = { type: 'shad', start: 20, duration: 400 };

  expect(wordsOf(result.slice(0, 2))).toEqual([
    [{ text: 'old\u00a0' }],
    [{ text: 'tail\u00a0', effect: shad }],
  ]);

  expect((result[2] as UniSlotNode).children).toEqual([{ text: 'bold', effect: shad }]);
});

test('keeps settled shad words on their hosts when a new batch starts', async () => {
  const wrapper = mount(Harness, {
    props: { nodes: ['old ', Shad({ start: 20, duration: 400 }, ['tail'])] },
  });

  await flushPromises();

  const [old, tail] = wrapper.findAllComponents(InlineText);

  const instances = [old!.vm.$, tail!.vm.$];

  const placeholder = tail!.find('text').element;

  await wrapper.setProps({
    nodes: [
      'old ',
      Shad({ start: 20, duration: 400 }, ['tail ']),
      Shad({ start: 50, duration: 300 }, ['new']),
    ],
  });

  const words = wrapper.findAllComponents(InlineText);

  expect(words.slice(0, 2).map((word) => word.vm.$)).toEqual(instances);

  expect(words[1]!.find('text').element).toBe(placeholder);

  expect(words[0]!.find('.fluxdown-inline-text__effect').exists()).toBe(false);

  expect(words[1]!.find('.fluxdown-inline-text__effect').exists()).toBe(true);

  expect(words[2]!.props('parts')).toEqual([
    { text: 'new', effect: { type: 'shad', start: 50, duration: 300 } },
  ]);
});

test('keeps styled boundaries while carrying chunk timing into their children', () => {
  const strong = Strong({}, ['bold']);

  const result = normalizeInlineNodes(
    [Chunk({ start: 20, duration: 400 }, ['before ', strong, ' after'])],
    createSlots(),
  );

  expect(result[1]).toMatchObject({ type: 'Strong', props: {} });

  const styled = result[1] as UniSlotNode;

  expect(styled.children).toEqual([
    { text: 'bold', effect: { type: 'chunk', start: 20, duration: 400 } },
  ]);

  expect(strong.children).toEqual(['bold']);

  expect(wordsOf(normalizeInlineNodes(styled.children!, createSlots()))[0][0].effect).toEqual({
    type: 'chunk',
    start: 20,
    duration: 400,
  });
});

test('uses grapheme positions for keys and preserves opaque component boundaries', () => {
  const component = {
    component: InlineText,
    props: { parts: [{ text: 'custom' }] },
    key: 'custom',
  };

  const result = normalizeInlineNodes(['👨‍👩‍👧‍👦 ', component, 'next'], createSlots());

  expect(result.map((node) => node.key)).toEqual(['inline:0', 'custom', 'inline:3']);

  expect(result[1]).toBe(component);
});

test('does not bypass a custom component inherited from a default effect slot', () => {
  const Component = defineComponent(() => () => h('text', 'custom'));

  class CustomScale extends EffectScaleSlotPlugin {
    constructor() {
      super();

      Object.defineProperty(this, 'Component', { value: Component });
    }
  }

  const node = Scale(SCALE, ['custom']);

  const slots = createSlots();

  slots.Scale!.push(new CustomScale());

  expect(normalizeInlineNodes([node], slots)).toEqual([node]);

  expect(slots.Scale!.at(-1)!.Component).toBe(Component);
});

test('retains nested effects instead of overwriting their timing and opacity', () => {
  const scaled = Scale(SCALE, ['animated']);

  const chunk = Chunk({ start: 50, duration: 400 }, [Strong({}, [scaled])]);

  const result = normalizeInlineNodes([chunk], createSlots());

  expect(result).toEqual([chunk]);

  expect((result[0] as UniSlotNode).children).toBe(chunk.children);

  const text = { text: 'animated', effect: { type: 'chunk' as const, start: 50, duration: 400 } };

  expect(new EffectScaleSlotPlugin().renderInline({ ...SCALE, children: [text] })).toBeNull();
});

test('does not combine distinct styled elements or discard custom keys and props', () => {
  const current: Element = {
    type: 'element',
    tagName: 'strong',
    properties: {},
    children: [],
  };

  const left = Strong({ current, style: { color: 'red' } }, ['left']);

  const differentSource = Strong(
    { current: { ...current, properties: {} }, style: { color: 'red' } },
    ['right'],
  );

  const differentProps = Strong({ current, style: { color: 'blue' } }, ['right']);

  const differentKey = { ...Strong({ ...left.props }, ['right']), key: 'custom' };

  for (const right of [differentSource, differentProps, differentKey]) {
    expect(normalizeInlineNodes([left, right], createSlots())).toEqual([left, right]);
  }
});

test('keys default styled slots by logical text position while preserving explicit keys', () => {
  const current: Element = {
    type: 'element',
    tagName: 'strong',
    properties: {},
    children: [],
  };

  const left = { ...Strong({ current }, ['it']), key: '1:element:strong' };

  const right = {
    ...Strong({ current: { ...current } }, ['a']),
    key: '0:element:strong',
  };

  const split = normalizeInlineNodes(['before ', left, '', { text: '' }, right], createSlots());

  const settled = normalizeInlineNodes(
    ['before ', { ...Strong({ current }, ['ita']), key: '1:element:strong' }],
    createSlots(),
  );

  expect(split).toHaveLength(2);

  expect(split[1]).toMatchObject({ key: 'inline:7:Strong', children: ['it', 'a'] });

  expect(settled[1].key).toBe(split[1].key);

  for (const key of ['render:custom', 'patch:mention', 'user-key']) {
    const custom = { ...left, key };

    expect(normalizeInlineNodes(['before ', custom], createSlots())[1]).toBe(custom);
  }
});
