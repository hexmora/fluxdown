import type { VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import { mount } from '@vue/test-utils';

import type { FluxdownRef } from '../packs';

import { FluxdownBase } from '../packs';

class TextRenderer extends BaseVueRenderPlugin {
  static readonly key: string = 'test-text';

  match() {
    return true;
  }

  render({ node, renderChildren }: VueRenderParams) {
    return node.type === 'text' ? node.value : renderChildren();
  }
}

test('renders and updates explicit plugins without adding a host element', async () => {
  const wrapper = mount(FluxdownBase, {
    props: { text: '**first**', plugins: { renders: [TextRenderer] } },
  });

  expect(wrapper.html()).toBe('first');

  await wrapper.setProps({ text: '*second*' });

  expect(wrapper.html()).toBe('second');

  expect((wrapper.vm as unknown as FluxdownRef).value).toBeDefined();
});

test('reuses equal plugin options and releases replaced and active plugins once', async () => {
  const counts = { created: 0, destroyed: 0 };

  class TrackedRenderer extends TextRenderer {
    static readonly key = 'test-tracked';

    constructor(_options: { label: string }) {
      super();

      counts.created += 1;
    }

    destroy() {
      counts.destroyed += 1;
    }
  }

  const wrapper = mount(FluxdownBase, {
    props: {
      text: 'content',
      plugins: { renders: [[TrackedRenderer, { label: 'first' }]] },
    },
  });

  await wrapper.setProps({ plugins: { renders: [[TrackedRenderer, { label: 'first' }]] } });

  expect(counts).toEqual({ created: 1, destroyed: 0 });

  await wrapper.setProps({ plugins: { renders: [[TrackedRenderer, { label: 'second' }]] } });

  expect(counts).toEqual({ created: 2, destroyed: 1 });

  (wrapper.vm as unknown as FluxdownRef).destroy();

  wrapper.unmount();

  expect(counts).toEqual({ created: 2, destroyed: 2 });
});
