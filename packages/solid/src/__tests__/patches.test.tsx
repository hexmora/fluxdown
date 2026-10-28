import type { IPatchItem } from '@fluxdown/core';
import type { JSX } from 'solid-js';

import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import { FluxdownLite } from '../packs/lite';

const createPatches = (label: string): IPatchItem<JSX.Element>[] => [
  {
    key: 'stable-range',
    range: [6, 11],
    render: (text?: string) => {
      return (
        <mark>
          {label}:{text}
        </mark>
      );
    },
  },
];

describe('render patches', () => {
  test('renders point and range patches in source order', () => {
    const { container } = render(() => (
      <FluxdownLite
        text="Hello world"
        patches={[
          {
            key: 'point',
            range: 5,
            render: (text) => {
              return <i>{text ?? '|'}</i>;
            },
          },
          ...createPatches('replacement'),
        ]}
      />
    ));

    expect(container.querySelector('i')?.textContent).toBe('|');

    expect(container.querySelector('mark')?.textContent).toBe('replacement:world');

    expect(container.textContent).toBe('Hello| replacement:world');
  });

  test('updates patch callbacks without recompiling unchanged Markdown', () => {
    const compile = vi.fn();

    class CompileCounter {
      static readonly key = 'test-compile-counter';

      readonly config = {};

      readonly plugin = () => () => {
        compile();
      };

      destroy() {}
    }

    const [patches, setPatches] = createSignal(createPatches('first'));

    const { container } = render(() => (
      <FluxdownLite
        text="Hello world"
        patches={patches()}
        plugins={{ remarks: [CompileCounter] }}
      />
    ));

    const calls = compile.mock.calls.length;

    setPatches(createPatches('second'));

    expect(container.querySelector('mark')?.textContent).toBe('second:world');

    expect(compile).toHaveBeenCalledTimes(calls);
  });

  test('ignores out-of-range patches and supports keyless replacements', () => {
    const [patches, setPatches] = createSignal<IPatchItem<JSX.Element>[]>([
      {
        range: [50, 60],
        render: () => {
          return <mark>hidden</mark>;
        },
      },
    ]);

    const { container } = render(() => <FluxdownLite text="visible" patches={patches()} />);

    expect(container.textContent).toBe('visible');

    setPatches([
      {
        range: [0, 7],
        render: (text) => {
          return <mark>{text}</mark>;
        },
      },
    ]);

    expect(container.querySelector('mark')?.textContent).toBe('visible');
  });
});
