import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { AnySlotPluggable } from '../type';

import { LinkSlotPlugin } from '../../../plugins/link/slot';
import { ParagraphSlotPlugin } from '../../../plugins/paragraph/slot';
import { BaseSlotPlugin } from '../base';
import { RenderNodes } from '../components/render-nodes';
import { provideSlots } from '../context';
import { createTypeOfSlot } from '../utils/create';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

interface HarnessProps {
  plugins: AnySlotPluggable[];

  text?: string;
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    provideSlots(() => props.plugins);

    return () => h(RenderNodes, { nodes: [Paragraph({}, [props.text ?? 'content'])] });
  },
  { props: ['plugins', 'text'] },
);

describe('Vapor slot descriptors', () => {
  test('defers only the first recursive mount while keeping later updates on the same outlet', async () => {
    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlotPlugin], text: 'first' } });

    const outlet = wrapper.getComponent(RenderNodes);

    const instance = outlet.vm.$;

    const anchor = wrapper.get('.fluxdown-render-nodes__anchor').element;

    const host = anchor.parentElement!;

    expect(outlet.props('nodes')).toHaveLength(1);

    expect(wrapper.text()).toBe('');

    expect(host.children).toHaveLength(1);

    expect(host.lastElementChild).toBe(anchor);

    await flushPromises();

    const text = wrapper.get('text').element;

    expect(wrapper.get('text').text().replaceAll('\u200b', '')).toBe('first');

    expect(anchor.parentElement).toBe(host);

    expect(host.lastElementChild).toBe(anchor);

    expect(host.firstElementChild).not.toBe(anchor);

    await wrapper.setProps({ text: 'second' });

    expect(wrapper.getComponent(RenderNodes).vm.$).toBe(instance);

    expect(wrapper.get('text').element).toBe(text);

    expect(wrapper.get('text').text().replaceAll('\u200b', '')).toBe('second');

    expect(anchor.parentElement).toBe(host);

    expect(host.lastElementChild).toBe(anchor);
  });

  test('does not construct descendants after an outlet is disposed before its first microtask', async () => {
    const setup = vi.fn(() => () => h('text', 'late'));

    class TrackedParagraph extends ParagraphSlotPlugin {
      readonly Component = defineComponent({ setup });
    }

    const wrapper = mount(Harness, { props: { plugins: [TrackedParagraph] } });

    wrapper.unmount();

    await flushPromises();

    expect(setup).not.toHaveBeenCalled();
  });

  test('renders native default-slot content from plain data', async () => {
    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlotPlugin] } });

    await flushPromises();

    expect(wrapper.get('text').text().replaceAll('\u200b', '')).toBe('content');

    expect(wrapper.find('view').exists()).toBe(true);

    expect(wrapper.get('view').attributes()).not.toHaveProperty('current');
  });

  test('uses the last slot override and destroys retired plugin instances', async () => {
    const destroy = vi.fn();

    class TrackedParagraph extends ParagraphSlotPlugin {
      destroy() {
        destroy();
      }
    }

    class Replacement extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'replacement-paragraph';

      readonly type = 'Paragraph';

      readonly Component = defineComponent({
        setup(_, { slots }) {
          return () => h('text', { class: 'replacement' }, slots.default?.());
        },
      });
    }

    const wrapper = mount(Harness, { props: { plugins: [TrackedParagraph] } });

    await wrapper.setProps({ plugins: [TrackedParagraph] });

    expect(destroy).not.toHaveBeenCalled();

    await wrapper.setProps({ plugins: [Replacement] });

    await flushPromises();

    expect(destroy).toHaveBeenCalledTimes(1);

    expect(wrapper.get('.replacement').text()).toBe('content');
  });

  test('allows native component descriptors without slot-name registration', async () => {
    const Component = defineComponent({
      props: ['label'],
      setup(props) {
        return () => h('text', props.label);
      },
    });

    const Host = defineComponent({
      setup() {
        provideSlots(() => []);

        return () =>
          h(RenderNodes, { nodes: [{ component: Component, props: { label: 'custom' } }] });
      },
    });

    const wrapper = mount(Host);

    await flushPromises();

    expect(wrapper.text()).toBe('custom');
  });
});

test('configured link callbacks receive external URLs without platform routing', async () => {
  const onPress = vi.fn();

  const Link = createTypeOfSlot('Link');

  const Host = defineComponent({
    setup() {
      provideSlots(() => [[LinkSlotPlugin, { onPress }]]);

      return () => h(RenderNodes, { nodes: [Link({ href: 'https://example.com' }, ['link'])] });
    },
  });

  const wrapper = mount(Host);

  await flushPromises();

  await wrapper.get('.fluxdown-link').trigger('click');

  expect(onPress).toHaveBeenCalledWith('https://example.com');
});
