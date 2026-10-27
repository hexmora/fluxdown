import type { IRenderPatchItem } from '@fluxdown/core';
import type { VueRenderParams } from '@fluxdown/vue-plugins/base';
import type { Element, ElementContent, Root } from 'hast';
import type { VNodeChild } from 'vue';

import { BaseVueRenderPlugin } from '@fluxdown/vue-plugins/base';
import { mount } from '@vue/test-utils';
import { MutableState } from 'stative';
import { defineComponent } from 'vue';

import { renderParentChildren } from '../utils';

class InlineRenderer extends BaseVueRenderPlugin {
  static readonly key = 'test-inline-renderer';

  match() {
    return true;
  }

  render({ node, renderChildren }: VueRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type !== 'element') {
      return null;
    }

    return <span data-word={node.data?.renderKey}>{renderChildren(node)}</span>;
  }
}

const text = (value: string): ElementContent => {
  return { type: 'text', value };
};

const word = (value: string): Element => {
  return {
    type: 'element',
    tagName: 'span',
    properties: {},
    data: { renderKey: value },
    children: [text(value)],
  };
};

interface HarnessProps {
  root: Root;
}

test('keeps an animated word in place when the preceding effect settles into text', async () => {
  const patches = MutableState.of<IRenderPatchItem<VNodeChild>[]>([]);

  const plugins = [new InlineRenderer()];

  const Harness = defineComponent(
    (props: HarnessProps) => {
      return () => {
        return <p>{renderParentChildren(props.root, [props.root], patches, plugins, null)}</p>;
      };
    },
    { props: ['root'] },
  );

  const wrapper = mount(Harness, {
    props: {
      root: {
        type: 'root',
        children: [
          text('opening, '),
          word('followed'),
          text(' '),
          word('by'),
          text(' '),
          word('careful'),
        ],
      },
    },
    attachTo: document.body,
  });

  const animated = wrapper.get('[data-word="by"]').element;

  const originalInsert = Node.prototype.insertBefore;

  const moved = vi.fn();

  vi.spyOn(Node.prototype, 'insertBefore').mockImplementation(function (
    this: Node,
    node: Node,
    child: Node | null,
  ) {
    if (node === animated && node.isConnected) {
      moved();
    }

    return originalInsert.call(this, node, child);
  });

  await wrapper.setProps({
    root: {
      type: 'root',
      children: [text('opening, followed '), word('by'), text(' '), word('carefully')],
    },
  });

  expect(wrapper.text()).toBe('opening, followed by carefully');

  expect(wrapper.get('[data-word="by"]').element).toBe(animated);

  expect(moved).not.toHaveBeenCalled();

  wrapper.unmount();

  patches.destroy();
});
