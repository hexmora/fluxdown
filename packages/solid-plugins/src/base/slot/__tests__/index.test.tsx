import type { Element } from 'hast';

import { fireEvent, render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';

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

  readonly Component = (props: ParagraphProps) => {
    return <p data-raw={String(props.Raw === null)}>{props.children}</p>;
  };
}

class ExtendedParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended';

  readonly type = 'Paragraph';

  readonly Component = (props: ParagraphProps) => {
    return (
      <section>
        <Dynamic component={props.Raw ?? undefined} {...props} />
      </section>
    );
  };
}

interface HarnessProps {
  plugins: AnySlotPluggable[];

  text?: string;
}

const Harness = (props: HarnessProps) => {
  return (
    <SlotProvider plugins={props.plugins}>
      <Paragraph current={paragraph} parents={[]} render={() => null}>
        {props.text ?? 'content'}
      </Paragraph>
    </SlotProvider>
  );
};

describe('slot composition', () => {
  test('composes through Raw in declaration order with reactive children', () => {
    const [text, setText] = createSignal('content');

    const view = render(() => (
      <Harness plugins={[ParagraphSlot, ExtendedParagraphSlot]} text={text()} />
    ));

    const element = view.container.querySelector('section p');

    expect(element?.textContent).toBe('content');

    expect(element?.getAttribute('data-raw')).toBe('true');

    setText('changed');

    expect(element?.textContent).toBe('changed');

    expect(view.container.querySelector('p')).toBe(element);
  });

  test('preserves equivalent plugins and destroys retired instances once', () => {
    const created = vi.fn();

    const destroyed = vi.fn();

    class TrackedParagraphSlot extends ParagraphSlot {
      constructor() {
        super();

        created();
      }

      destroy() {
        destroyed();
      }
    }

    const [plugins, setPlugins] = createSignal<AnySlotPluggable[]>([TrackedParagraphSlot]);

    const view = render(() => <Harness plugins={plugins()} />);

    setPlugins([TrackedParagraphSlot]);

    expect(created).toHaveBeenCalledTimes(1);

    expect(destroyed).not.toHaveBeenCalled();

    setPlugins([ExtendedParagraphSlot]);

    expect(destroyed).toHaveBeenCalledTimes(1);

    view.unmount();

    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  test('wraps a named slot and reports its type', () => {
    class WrapperSlot extends BaseSlotPlugin<'Wrapper'> {
      static readonly key = 'test-wrapper';

      readonly type = 'Wrapper';

      readonly Component = (props: WrapperProps) => {
        return <article data-slot={props.type}>{props.children}</article>;
      };
    }

    const view = render(() => <Harness plugins={[ParagraphSlot, WrapperSlot]} />);

    expect(view.container.querySelector('article')?.getAttribute('data-slot')).toBe('Paragraph');

    expect(view.container.querySelector('article p')?.textContent).toBe('content');
  });

  test('renders a recoverable fallback when a slot throws', () => {
    let broken = true;

    class BrokenParagraphSlot extends ParagraphSlot {
      readonly Component = (props: ParagraphProps) => {
        if (broken) {
          throw new Error('slot failed');
        }

        return <p>{props.children}</p>;
      };
    }

    class FallbackSlot extends BaseSlotPlugin<'Fallback'> {
      static readonly key = 'test-fallback';

      readonly type = 'Fallback';

      readonly Component = (props: FallbackProps) => {
        return (
          <button
            onClick={() => {
              broken = false;

              props.onReset?.();
            }}
          >
            {props.error instanceof Error ? props.error.message : 'unknown'}
          </button>
        );
      };
    }

    const view = render(() => <Harness plugins={[BrokenParagraphSlot, FallbackSlot]} />);

    fireEvent.click(view.getByText('slot failed'));

    expect(view.container.querySelector('p')?.textContent).toBe('content');
  });

  test('requires a provider and renders missing slots as empty content', () => {
    const view = render(() => <Harness plugins={[]} />);

    expect(view.container.textContent).toBe('');

    expect(() =>
      render(() => <Paragraph current={paragraph} parents={[]} render={() => null} />),
    ).toThrow('requires a Fluxdown SlotProvider');
  });
});
