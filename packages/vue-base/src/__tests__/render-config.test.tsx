import type { VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import { mount } from '@vue/test-utils';

import { FluxdownBase } from '../packs';

class LinkRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'test-link';

  match() {
    return true;
  }

  render({ getProps, node, renderChildren }: VueRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type === 'element' && node.tagName === 'a') {
      return [String(getProps().href ?? ''), renderChildren()];
    }

    return renderChildren();
  }
}

test('updates property conversion independently of unchanged text and plugins', async () => {
  const wrapper = mount(FluxdownBase, {
    props: {
      plugins: { renders: [LinkRenderPlugin] },
      text: '[content](https://example.com)',
    },
  });

  expect(wrapper.text()).toBe('https://example.comcontent');

  await wrapper.setProps({ getProps: null });

  expect(wrapper.text()).toBe('content');

  await wrapper.setProps({ getProps: (node) => ({ href: `custom:${node?.tagName}:` }) });

  expect(wrapper.text()).toBe('custom:a:content');

  await wrapper.setProps({ getProps: undefined });

  expect(wrapper.text()).toBe('https://example.comcontent');
});

test('uses the latest property converter when content changes', async () => {
  const first = vi.fn(() => ({ href: 'first:' }));

  const second = vi.fn(() => ({ href: 'second:' }));

  const wrapper = mount(FluxdownBase, {
    props: {
      plugins: { renders: [LinkRenderPlugin] },
      text: '[content](https://example.com)',
      getProps: first,
    },
  });

  expect(wrapper.text()).toBe('first:content');

  await wrapper.setProps({ getProps: second });

  await wrapper.setProps({ text: '[updated](https://example.com)' });

  expect(wrapper.text()).toBe('second:updated');

  expect(second).toHaveBeenCalled();
});
