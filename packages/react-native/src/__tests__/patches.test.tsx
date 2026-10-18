import type { IPatchItem } from '@fluxdown/core';
import type { IRemarkPlugin } from '@fluxdown/types';
import type { ReactNode } from 'react';

import { BaseRemarkPlugin } from '@fluxdown/core-presets/remark';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Fluxdown } from '..';
import { expectNativeTextContainers, textContent } from './utils/native';

const createPatches = (label: string): IPatchItem<ReactNode>[] => [
  {
    key: 'stable-range',
    range: [6, 11],
    render: (text) => (
      <Text testID="replacement">
        {label}:{text}
      </Text>
    ),
  },
];

describe('Fluxdown native patches', () => {
  test('renders insertion and replacement patches in source order', () => {
    const view = render(
      <Fluxdown
        text="Hello world"
        patches={[
          {
            key: 'point',
            range: 5,
            render: () => <Text testID="point">|</Text>,
          },
          {
            range: [6, 11],
            render: (text) => <Text testID="replacement">{text}</Text>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('point')).toHaveTextContent('|');

    expect(screen.getByTestId('replacement')).toHaveTextContent('world');

    expect(textContent(view.toJSON())).toBe('Hello| world');

    expectNativeTextContainers(view.toJSON());
  });

  test('changes a patch callback without recompiling or notifying during render', async () => {
    const compiled = jest.fn();

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    class CompileCounter extends BaseRemarkPlugin {
      static readonly key = 'native-patch-compile-counter';

      plugin: IRemarkPlugin['plugin'] = () => () => {
        compiled();
      };
    }

    const plugins = [{ remarks: [CompileCounter] }];

    const view = render(
      <Fluxdown text="Hello world" patches={createPatches('first')} plugins={plugins} />,
    );

    const compileCount = compiled.mock.calls.length;

    view.rerender(
      <Fluxdown text="Hello world" patches={createPatches('second')} plugins={plugins} />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('replacement')).toHaveTextContent('second:world'),
    );

    expect(compiled).toHaveBeenCalledTimes(compileCount);

    expect(
      consoleError.mock.calls
        .flat()
        .some((value) => String(value).includes('while rendering a different component')),
    ).toBe(false);

    consoleError.mockRestore();
  });

  test('ignores an out-of-range patch without hiding source content', () => {
    render(
      <Fluxdown
        text="visible"
        patches={[
          {
            range: [50, 60],
            render: () => <Text testID="hidden">hidden</Text>,
          },
        ]}
      />,
    );

    expect(screen.queryByTestId('hidden')).toBeNull();

    expect(screen.getByText('visible')).toBeTruthy();
  });
});
