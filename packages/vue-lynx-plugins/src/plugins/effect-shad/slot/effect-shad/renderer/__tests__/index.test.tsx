import type { VNode } from 'vue';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { h, nextTick, shallowRef } from 'vue';

import { ShadRenderer } from '..';
import { TextLayoutWidthProvider } from '../../../../../../base';
import { getGradient, getShadTokens, getText, splitShadToken } from '../utils';

beforeEach(() => {
  vi.stubGlobal('lynx', { getTextInfo: (text: string) => ({ width: text.length * 10 }) });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('preserves spaces and word wrapping opportunities in the shaded tail', () => {
  const view = mount(ShadRenderer, {
    props: { leading: 'leading ', active: 'tail with spaces', isActive: true, maskWidth: 15 },
  });

  expect(view.findAll('.fluxdown-shad-active').map((word) => word.text())).toEqual([
    'tail',
    'with',
    'spaces',
  ]);

  expect(view.text()).toBe('leading tail with spaces');

  expect(view.find('.fluxdown-shad-mask').attributes('style')).toContain('margin-left: -15px');
});

test('uses the same unwrapped gradient range across CJK wrap opportunities', () => {
  const { tokens } = getShadTokens('before ', '文字');

  const measurements = Object.fromEntries(tokens.map((token) => [token.key, { width: 20 }]));

  expect(getGradient(tokens, measurements, tokens[0]!.key)).toEqual({ start: 0, width: 40 });

  expect(getGradient(tokens, measurements, tokens[1]!.key)).toEqual({ start: -20, width: 40 });
});

test('retains measured glyph widths when the parent first reports its layout width', async () => {
  const width = shallowRef<number>();

  const fontSize = shallowRef('16px');

  const view = mount(() => (
    <TextLayoutWidthProvider value={width.value}>
      <ShadRenderer
        leading=""
        active="one two"
        isActive={true}
        maskWidth={15}
        style={{ fontSize: fontSize.value }}
      />
    </TextLayoutWidthProvider>
  ));

  const words = view.findAll('.fluxdown-shad-active');

  for (const [index, word] of words.entries()) {
    const node = (word.element as unknown as { __vnode: VNode }).__vnode;

    node.props?.bindlayoutchange({ detail: { width: index === 0 ? 15 : 20 } });
  }

  await nextTick();

  const measured = words[0]!.attributes('style');

  expect(measured).toContain('transparent 300%');

  width.value = 362;

  await nextTick();

  expect(words[0]!.attributes('style')).toBe(measured);

  fontSize.value = '20px';

  await nextTick();

  expect(words[0]!.attributes('style')).not.toContain('transparent 300%');
});

test('splits rich Vue nodes without losing text styles or duplicating opaque content', () => {
  const image = h('image', { src: 'https://example.com/image.png' });

  const rich = h('text', { style: { color: '#0969da' } }, 'wdown');

  const result = getShadTokens([image, 'before Flo'], rich);

  expect(getText(result.leading)).toBe('before ');

  expect(result.tokens).toHaveLength(1);

  expect(result.tokens[0]).toMatchObject({ text: 'Flowdown', prefixText: 'Flo' });

  const view = mount(ShadRenderer, {
    props: { leading: [image, 'before Flo'], active: rich, isActive: true, maskWidth: 15 },
  });

  expect(view.findAll('image')).toHaveLength(1);

  expect(view.find('.fluxdown-shad-active text').text()).toBe('Flowdown');

  expect(view.find('.fluxdown-shad-prefix').text()).toBe('Flo');

  expect(view.find('.fluxdown-shad-active').html()).toContain('rgb(9, 105, 218)');
});

test('keeps a long word intact until native line layout supplies split boundaries', () => {
  const { tokens } = getShadTokens('', 'unbreakable');

  expect(tokens).toHaveLength(1);

  const fragments = splitShadToken(tokens[0]!, [5, 11]);

  expect(fragments.map((token) => token.text)).toEqual(['unbre', 'akable']);

  expect(fragments.map((token) => getText(token.children))).toEqual(['unbre', 'akable']);

  const measurements = Object.fromEntries(fragments.map((token) => [token.key, { width: 50 }]));

  expect(getGradient(fragments, measurements, fragments[1]!.key)).toEqual({
    start: -50,
    width: 100,
  });
});

test('retains the zero-advance tail marker after the shade has finished', async () => {
  const view = mount(ShadRenderer, {
    props: { leading: 'before ', active: 'after', isActive: true, maskWidth: 15 },
  });

  await view.setProps({ isActive: false });

  expect(view.findAll('.fluxdown-shad-active')).toHaveLength(0);

  expect(view.text()).toBe('before after');

  expect(view.find('.fluxdown-shad-mask').attributes('style')).toContain('opacity: 0');
});
