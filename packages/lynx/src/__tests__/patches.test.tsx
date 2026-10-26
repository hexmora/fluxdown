import type { IPluginItem } from '@fluxdown/lynx-plugins/typings';
import type { IPluggable, IRemarkPlugin } from '@fluxdown/types';

import { render, screen, waitFor } from '@lynx-js/react/testing-library';
import { describe, expect, test } from '@rstest/core';

import { Fluxdown } from '../packs/full';

type RemarkPluggable = IPluggable<IRemarkPlugin, unknown>;

const createPatches = (label: string) => [
  {
    key: 'stable-range',
    range: [6, 11] as [number, number],
    render: (text?: string) => (
      <text data-testid="replacement">
        {label}:{text}
      </text>
    ),
  },
];

describe('Fluxdown patches', () => {
  test('renders point and replacement patches in source order and passes replaced text', () => {
    const { container } = render(
      <Fluxdown
        text="Hello world"
        patches={[
          {
            key: 'point',
            range: 5,
            render: (text?: string) => <text data-testid="point">{text ?? '|'}</text>,
          },
          {
            key: 'replacement',
            range: [6, 11],
            render: (text?: string) => <text data-testid="replacement">{text}</text>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('point')).toHaveTextContent('|');
    expect(screen.getByTestId('replacement')).toHaveTextContent('world');
    expect(container.firstElementChild).toHaveTextContent('Hello| world');
  });

  test('reacts to patch render changes even when text and patch range stay unchanged', async () => {
    let compileCount = 0;

    class CompileCounterRemarkPlugin {
      static readonly key = 'test-patch-compile-counter';

      readonly config = {};

      readonly plugin = () => () => {
        compileCount += 1;
      };

      destroy() {}
    }

    const plugins: IPluginItem[] = [
      {
        remarks: [CompileCounterRemarkPlugin as unknown as RemarkPluggable],
      },
    ];
    const { rerender } = render(
      <Fluxdown text="Hello world" patches={createPatches('first')} plugins={plugins} />,
    );

    expect(screen.getByTestId('replacement')).toHaveTextContent('first:world');

    const initialCompileCount = compileCount;

    rerender(<Fluxdown text="Hello world" patches={createPatches('second')} plugins={plugins} />);

    await waitFor(() => {
      expect(screen.getByTestId('replacement')).toHaveTextContent('second:world');
    });

    expect(compileCount).toBe(initialCompileCount);
  });

  test('renders patches without an explicit key', () => {
    render(
      <Fluxdown
        text="keyless"
        patches={[
          {
            range: [0, 7],
            render: (text?: string) => <text data-testid="keyless-patch">{text}</text>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('keyless-patch')).toHaveTextContent('keyless');
  });

  test('ignores an out-of-range patch without hiding source content', () => {
    render(
      <Fluxdown
        text="visible"
        patches={[
          {
            range: [50, 60],
            render: () => <text data-testid="out-of-range-patch">hidden</text>,
          },
        ]}
      />,
    );

    expect(screen.queryByTestId('out-of-range-patch')).not.toBeInTheDocument();
    expect(screen.getByText('visible')).toBeInTheDocument();
  });
});
