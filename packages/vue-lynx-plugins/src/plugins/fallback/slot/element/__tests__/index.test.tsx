import type { Element } from 'hast';

import { mount } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import { createVNode, Text } from 'vue';

import { ElementRenderer } from '../renderer';

const code: Element = {
  type: 'element',
  tagName: 'code',
  properties: {},
  children: [{ type: 'text', value: 'inline code wraps' }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('native inline code retains per-word attachments when Vue supplies keyed text nodes', () => {
  vi.stubGlobal('SystemInfo', { platform: 'iOS' });

  const view = mount(ElementRenderer, {
    props: {
      Raw: null,
      current: code,
      parents: [],
      render: () => null,
      tagName: 'code',
      children: [createVNode(Text, { key: 'text:start' }, 'inline code wraps')],
    },
  });

  expect(view.findAll('.fluxdown-inline-code > view')).toHaveLength(3);

  expect(view.text()).toBe('inline code wraps');

  const fragments = view.findAll('.fluxdown-inline-code > view');

  expect(fragments[0]!.attributes('style')).toContain('border-left:');

  expect((fragments[1]!.element as HTMLElement).style.paddingLeft).toBe('0px');

  expect(fragments[2]!.attributes('style')).toContain('border-right:');
});

test('Web inline code keeps a single text box with normal wrapping', () => {
  vi.stubGlobal('SystemInfo', { platform: 'web' });

  const view = mount(ElementRenderer, {
    props: {
      Raw: null,
      current: code,
      parents: [],
      render: () => null,
      tagName: 'code',
      children: [createVNode(Text, { key: 'text:start' }, 'inline code wraps')],
    },
  });

  expect(view.findAll('.fluxdown-inline-code > view')).toHaveLength(0);

  expect(view.text()).toBe('inline code wraps');
});
