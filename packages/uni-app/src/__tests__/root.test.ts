import { RenderNodes } from '@fluxdown/uni-app-plugins/base';
import { flushPromises, mount } from '@vue/test-utils';

import { RootReconciler } from '../components/root-reconciler';
import { FluxdownLite } from '../packs/lite';
import { getText } from './utils/text';

test('mounts the root outlet once before inserting an initially complete document', async () => {
  const text =
    '# Heading\n\nA **bold** paragraph.\n\n> Quote\n\n- one\n- two\n\n| A | B |\n| - | - |\n| 1 | 2 |';

  const wrapper = mount(FluxdownLite, { props: { text } });

  const root = wrapper.getComponent(RootReconciler);

  const outlet = root.getComponent(RenderNodes);

  const instance = outlet.vm.$;

  expect(root.props('value').value.length).toBeGreaterThan(0);

  expect(outlet.props('nodes').length).toBeGreaterThan(0);

  expect(getText(wrapper.element)).toBe('');

  await flushPromises();

  expect(root.getComponent(RenderNodes).vm.$).toBe(instance);

  expect(outlet.props('nodes').length).toBeGreaterThan(0);

  expect(getText(wrapper.element)).toContain('HeadingA bold paragraph.Quote');

  expect(wrapper.find('.fluxdown-table').exists()).toBe(true);

  const heading = wrapper.get('.fluxdown-heading').element;

  await wrapper.setProps({ text: `${text}\n\nTail` });

  await flushPromises();

  expect(root.getComponent(RenderNodes).vm.$).toBe(instance);

  expect(wrapper.get('.fluxdown-heading').element).toBe(heading);

  expect(getText(wrapper.element)).toContain('Tail');

  await wrapper.setProps({ text: `${text}\n\nTail updated` });

  expect(getText(wrapper.element)).toContain('Tail updated');

  expect(wrapper.get('.fluxdown-heading').element).toBe(heading);
});

test('does not recreate a root outlet unmounted before its first update', async () => {
  const wrapper = mount(FluxdownLite, { props: { text: '# Heading' } });

  const outlet = wrapper.getComponent(RootReconciler).getComponent(RenderNodes).vm.$;

  wrapper.unmount();

  await flushPromises();

  expect(outlet.isUnmounted).toBe(true);

  expect(wrapper.element.textContent).toBe('');
});
