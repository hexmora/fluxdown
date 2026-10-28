import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { AnySlotPluggable } from '../type';

import { LinkSlotPlugin } from '../../../plugins/link/slot';
import { ParagraphSlotPlugin } from '../../../plugins/paragraph/slot';
import { BaseSlotPlugin } from '../base';
import RenderNodes from '../components/render-nodes/index.uvue';
import { provideSlots } from '../context';
import { createTypeOfSlot } from '../utils/create';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

const Harness = /*#__PURE__*/ defineComponent(
  (props: { plugins: AnySlotPluggable[] }) => {
    provideSlots(() => props.plugins);

    return () => h(RenderNodes, { nodes: [Paragraph({}, ['content'])] });
  },
  { props: ['plugins'] },
);

describe('Vapor slot descriptors', () => {
  test('renders native default-slot content from plain data', () => {
    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlotPlugin] } });

    expect(wrapper.text()).toBe('content');

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

    expect(destroy).toHaveBeenCalledTimes(1);

    expect(wrapper.get('.replacement').text()).toBe('content');
  });

  test('allows native component descriptors without slot-name registration', () => {
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

    expect(mount(Host).text()).toBe('custom');
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

  await wrapper.get('.fluxdown-link').trigger('click');

  expect(onPress).toHaveBeenCalledWith('https://example.com');
});
