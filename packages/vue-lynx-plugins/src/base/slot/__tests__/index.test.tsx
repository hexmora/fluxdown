import type { Element } from 'hast';

import { SlotProvider } from '@fluxdown/vue-base-plugins/base';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

import type { AnySlotPluggable, FallbackProps, ParagraphProps, WrapperProps } from '..';

import { BaseSlotPlugin, createTypeOfSlot } from '..';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

const paragraph: Element = {
  type: 'element',
  tagName: 'text',
  properties: {},
  children: [],
};

class ParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ children, Raw }: ParagraphProps) => {
    return <text data-raw={String(Raw === null)}>{children}</text>;
  };
}

class ExtendedParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => {
    return <view>{Raw ? h(Raw, props, { default: () => props.children }) : null}</view>;
  };
}

interface HarnessProps {
  plugins: AnySlotPluggable[];
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    return () => {
      return (
        <SlotProvider plugins={props.plugins}>
          <Paragraph current={paragraph} parents={[]} render={() => null}>
            content
          </Paragraph>
        </SlotProvider>
      );
    };
  },
  { props: ['plugins'] },
);

describe('slot composition', () => {
  test('composes native Vue default slots through Raw in declaration order', () => {
    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlot, ExtendedParagraphSlot] } });

    expect(wrapper.get('view text').text()).toBe('content');

    expect(wrapper.get('text').attributes('data-raw')).toBe('true');

    wrapper.unmount();
  });

  test('supplies a native default slot to defineComponent renderers', () => {
    class NativeParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'native-paragraph';

      readonly type = 'Paragraph';

      readonly Component = defineComponent(
        (_, { slots }) => {
          return () => {
            return <text>{slots.default?.()}</text>;
          };
        },
        { inheritAttrs: false },
      );
    }

    const wrapper = mount(Harness, { props: { plugins: [NativeParagraphSlot] } });

    expect(wrapper.get('text').text()).toBe('content');

    wrapper.unmount();
  });

  test('preserves instances for equivalent pluggables and destroys retired plugins', async () => {
    const destroyed = vi.fn();

    const created = vi.fn();

    class TrackedParagraphSlot extends ParagraphSlot {
      constructor() {
        super();

        created();
      }

      destroy() {
        destroyed();
      }
    }

    const wrapper = mount(Harness, { props: { plugins: [TrackedParagraphSlot] } });

    await wrapper.setProps({ plugins: [TrackedParagraphSlot] });

    expect(created).toHaveBeenCalledTimes(1);

    expect(destroyed).not.toHaveBeenCalled();

    await wrapper.setProps({ plugins: [ExtendedParagraphSlot] });

    expect(destroyed).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  test('wraps a named slot and reports its type', () => {
    class WrapperSlot extends BaseSlotPlugin<'Wrapper'> {
      static readonly key = 'test-wrapper';

      readonly type = 'Wrapper';

      readonly Component = ({ children, type }: WrapperProps) => {
        return <view data-slot={type}>{children}</view>;
      };
    }

    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlot, WrapperSlot] } });

    expect(wrapper.get('view').attributes('data-slot')).toBe('Paragraph');

    expect(wrapper.get('view text').text()).toBe('content');

    wrapper.unmount();
  });

  test('renders a recoverable fallback when a slot throws', async () => {
    let broken = true;

    let reset: (() => void) | undefined;

    class BrokenParagraphSlot extends ParagraphSlot {
      readonly Component = ({ children }: ParagraphProps) => {
        if (broken) {
          throw new Error('slot failed');
        }

        return <text>{children}</text>;
      };
    }

    class FallbackSlot extends BaseSlotPlugin<'Fallback'> {
      static readonly key = 'test-fallback';

      readonly type = 'Fallback';

      readonly Component = ({ error, onReset }: FallbackProps) => {
        reset = () => {
          broken = false;

          onReset?.();
        };

        return <text>{error instanceof Error ? error.message : 'unknown'}</text>;
      };
    }

    const wrapper = mount(Harness, { props: { plugins: [BrokenParagraphSlot, FallbackSlot] } });

    await nextTick();

    expect(wrapper.get('text').text()).toBe('slot failed');

    reset?.();

    await nextTick();

    expect(wrapper.get('text').text()).toBe('content');

    wrapper.unmount();
  });

  test('requires a provider and renders missing slots as empty content', () => {
    const missing = mount(Harness, { props: { plugins: [] } });

    expect(missing.text()).toBe('');

    missing.unmount();

    expect(() =>
      mount(Paragraph, {
        props: { current: paragraph, parents: [], render: () => null },
      }),
    ).toThrow('requires a Fluxdown SlotProvider');
  });
});
