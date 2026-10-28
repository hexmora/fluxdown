import type { Element } from 'hast';

import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

import type { AnySlotPluggable, FallbackProps, ParagraphProps, WrapperProps } from '..';

import { BaseSlotPlugin, createTypeOfSlot, SlotProvider } from '..';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

const paragraph: Element = {
  type: 'element',
  tagName: 'p',
  properties: {},
  children: [],
};

class ParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ children, Raw }: ParagraphProps) => {
    return <p data-raw={String(Raw === null)}>{children}</p>;
  };
}

class ExtendedParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => {
    return <section>{Raw ? h(Raw, props, { default: () => props.children }) : null}</section>;
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

    expect(wrapper.get('section p').text()).toBe('content');

    expect(wrapper.get('p').attributes('data-raw')).toBe('true');

    wrapper.unmount();
  });

  test('supplies a native default slot to defineComponent renderers', () => {
    class NativeParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'native-paragraph';

      readonly type = 'Paragraph';

      readonly Component = defineComponent(
        (_, { slots }) => {
          return () => {
            return <p>{slots.default?.()}</p>;
          };
        },
        { inheritAttrs: false },
      );
    }

    const wrapper = mount(Harness, { props: { plugins: [NativeParagraphSlot] } });

    expect(wrapper.get('p').text()).toBe('content');

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
        return <article data-slot={type}>{children}</article>;
      };
    }

    const wrapper = mount(Harness, { props: { plugins: [ParagraphSlot, WrapperSlot] } });

    expect(wrapper.get('article').attributes('data-slot')).toBe('Paragraph');

    expect(wrapper.get('article p').text()).toBe('content');

    wrapper.unmount();
  });

  test('renders a recoverable fallback when a slot throws', async () => {
    let broken = true;

    class BrokenParagraphSlot extends ParagraphSlot {
      readonly Component = ({ children }: ParagraphProps) => {
        if (broken) {
          throw new Error('slot failed');
        }

        return <p>{children}</p>;
      };
    }

    class FallbackSlot extends BaseSlotPlugin<'Fallback'> {
      static readonly key = 'test-fallback';

      readonly type = 'Fallback';

      readonly Component = ({ error, onReset }: FallbackProps) => {
        return (
          <button
            onClick={() => {
              broken = false;

              onReset?.();
            }}
          >
            {error instanceof Error ? error.message : 'unknown'}
          </button>
        );
      };
    }

    const wrapper = mount(Harness, { props: { plugins: [BrokenParagraphSlot, FallbackSlot] } });

    await nextTick();

    expect(wrapper.get('button').text()).toBe('slot failed');

    await wrapper.get('button').trigger('click');

    expect(wrapper.get('p').text()).toBe('content');

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
