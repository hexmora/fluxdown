import type { VueRenderParams } from '@fluxdown/vue-base-plugins/base';

import { BaseVueRenderPlugin, useBlockLayout } from '@fluxdown/vue-base-plugins/base';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { FluxdownBase } from '../packs';

const LayoutProbe = defineComponent((_, { slots }) => {
  const layout = useBlockLayout();

  return () => {
    const previous = layout.value.previous?.children[0];

    return (
      <p
        data-first={layout.value.first}
        data-last={layout.value.last}
        data-previous={previous?.type === 'element' ? previous.tagName : ''}
      >
        {slots.default?.()}
      </p>
    );
  };
});

class LayoutRenderer extends BaseVueRenderPlugin {
  static readonly key = 'test-layout';

  match() {
    return true;
  }

  render({ node, renderChildren }: VueRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    return <LayoutProbe>{{ default: () => renderChildren() }}</LayoutProbe>;
  }
}

test('updates block position and preceding syntax without adding host wrappers', async () => {
  const wrapper = mount(FluxdownBase, {
    props: {
      plugins: { renders: [LayoutRenderer] },
      text: '# First\n\nSecond',
    },
  });

  const first = wrapper.findAll('p')[0]!.element;

  expect(wrapper.findAll('p').map((node) => node.attributes())).toEqual([
    { 'data-first': 'true', 'data-last': 'false', 'data-previous': '' },
    { 'data-first': 'false', 'data-last': 'true', 'data-previous': 'h1' },
  ]);

  expect(wrapper.find('div').exists()).toBe(false);

  await wrapper.setProps({ text: '# First\n\nSecond\n\nThird' });

  expect(wrapper.findAll('p')[0]!.element).toBe(first);

  expect(wrapper.findAll('p').map((node) => node.attributes())).toEqual([
    { 'data-first': 'true', 'data-last': 'false', 'data-previous': '' },
    { 'data-first': 'false', 'data-last': 'false', 'data-previous': 'h1' },
    { 'data-first': 'false', 'data-last': 'true', 'data-previous': 'p' },
  ]);
});
