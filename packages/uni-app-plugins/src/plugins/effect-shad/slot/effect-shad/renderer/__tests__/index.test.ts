import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { RendererProps } from '../type';

import InlineCanvas from '../../../../../../base/components/inline-canvas/index.uvue';
import { provideSlots } from '../../../../../../base/slot/context';
import ShadText from '../components/text/index.uvue';
import ShadRenderer from '../index.uvue';

const Host = /*#__PURE__*/ defineComponent(
  (props: RendererProps) => {
    provideSlots(() => []);

    return () => h(ShadRenderer, props);
  },
  { props: ['leading', 'active', 'isActive', 'maskWidth', 'offset'] },
);

test('retains word canvas instances when the preceding word leaves the shad tail', async () => {
  const wrapper = mount(Host, {
    props: { leading: 'Streaming ', active: 'te', isActive: true, maskWidth: 15, offset: 0 },
  });

  const text = wrapper.getComponent(ShadText).vm.$;

  const first = wrapper.getComponent(InlineCanvas).vm.$;

  await wrapper.setProps({ leading: '', active: 'text sta', offset: 10 });

  expect(wrapper.getComponent(ShadText).vm.$).toBe(text);

  const words = wrapper.findAllComponents(InlineCanvas);

  expect(words[0].props('text')).toBe('text\u00a0');

  expect(words[0].vm.$).toBe(first);

  expect(words[1].vm.$).not.toBe(first);

  const next = words[1].vm.$;

  await wrapper.setProps({ leading: 'text ', active: 'stays on', offset: 10 });

  expect(wrapper.findAllComponents(InlineCanvas)[0].vm.$).toBe(next);

  await wrapper.setProps({ leading: '', active: 'stays on', offset: 15 });

  expect(wrapper.getComponent(ShadText).vm.$).toBe(text);

  expect(wrapper.findAllComponents(InlineCanvas)[0].vm.$).toBe(next);
});
