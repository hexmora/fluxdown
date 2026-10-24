import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { renderHook } from '@testing-library/react';

import { useMergePlugins } from '..';

describe('useMergePlugins', () => {
  test.each(['mappers', 'remarks', 'rehypes', 'repairs', 'renders', 'slots'] as const)(
    'keeps preset entries before user entries in the %s channel',
    (type) => {
      const preset = { name: 'preset' } as never;
      const first = { name: 'first' } as never;
      const last = { name: 'last' } as never;
      const presets: IPluginItem[] = [{ [type]: [preset] }];
      const plugins: IPluginItem[] = [{ [type]: [first] }, { [type]: [last] }];
      const { result } = renderHook(() => useMergePlugins(presets, plugins));

      expect(result.current[type]).toEqual([preset, first, last]);
    },
  );
});
