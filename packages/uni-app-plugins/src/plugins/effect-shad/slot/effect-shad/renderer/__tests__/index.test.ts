import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { RendererProps } from '../type';

import { ShadRenderer } from '..';
import { MaskedText } from '../../../../../../base/components/masked-text';
import { provideSlots } from '../../../../../../base/slot/context';
import { ShadText } from '../components/text';

const Host = /*#__PURE__*/ defineComponent(
  (props: RendererProps) => {
    provideSlots(() => []);

    return () => h(ShadRenderer, props);
  },
  { props: ['leading', 'active', 'isActive', 'maskWidth', 'offset'] },
);

test('retains native text instances while words enter and leave the active tail', async () => {
  const wrapper = mount(Host, {
    props: { leading: 'Streaming ', active: 'te', isActive: true, maskWidth: 15, offset: 0 },
  });

  await flushPromises();

  const text = wrapper.getComponent(ShadText).vm.$;

  const first = wrapper.findAllComponents(MaskedText)[1].vm.$;

  await wrapper.setProps({ leading: '', active: 'text sta', offset: 10 });

  expect(wrapper.getComponent(ShadText).vm.$).toBe(text);

  const words = wrapper.findAllComponents(MaskedText);

  expect(words[0].props('text')).toBe('text\u00a0');

  expect(words[0].vm.$).toBe(first);

  expect(words[1].vm.$).not.toBe(first);

  const next = words[1].vm.$;

  await wrapper.setProps({ leading: 'text ', active: 'stays on', offset: 10 });

  expect(wrapper.findAllComponents(MaskedText)[0].vm.$).toBe(first);

  expect(wrapper.findAllComponents(MaskedText)[0].props('maskText')).toBe('');

  expect(wrapper.findAllComponents(MaskedText)[1].vm.$).toBe(next);

  await wrapper.setProps({ leading: '', active: 'stays on', offset: 15 });

  expect(wrapper.getComponent(ShadText).vm.$).toBe(text);

  expect(wrapper.findAllComponents(MaskedText)[0].vm.$).toBe(next);

  const placeholder = wrapper.getComponent(MaskedText).find('text').element;

  await wrapper.setProps({ isActive: false });

  expect(wrapper.getComponent(MaskedText).vm.$).toBe(next);

  expect(wrapper.getComponent(MaskedText).props('maskText')).toBe('');

  expect(wrapper.getComponent(MaskedText).find('text').element).toBe(placeholder);
});
