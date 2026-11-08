import type {
  IPluggable,
  IPluggableConfig,
  IPluginWithConfig,
  IRemarkPlugin,
} from '@fluxdown/types';
import type { ReactNode } from 'react';

import { isPluggablesEqual } from '@fluxdown/core';
import { first } from 'lodash-es';

import type { FluxdownProps, IPluginItem } from '../../../full';

import { isPropsEqual } from '..';

declare global {
  interface RemarkConfigs {
    'test-plugin': IPluggableConfig<{ nested: { enabled: boolean } }>;
  }
}

class TestPlugin implements IPluginWithConfig {
  static readonly key = 'test-plugin';

  readonly config = {};
}

class ReplacementTestPlugin implements IPluginWithConfig {
  static readonly key = 'test-plugin';

  readonly config = {};
}

type TestPluggable = IPluggable<IPluginWithConfig, unknown>;

const plugin = TestPlugin as TestPluggable;

const replacementPlugin = ReplacementTestPlugin as TestPluggable;

const renderPatch = (): ReactNode => null;

describe('comparison utilities', () => {
  test('treats omitted plugin lists as empty lists', () => {
    expect(isPluggablesEqual()).toBe(true);

    expect(isPluggablesEqual(undefined, [])).toBe(true);

    expect(isPluggablesEqual([], undefined)).toBe(true);

    expect(isPluggablesEqual(undefined, [plugin])).toBe(false);

    expect(isPluggablesEqual([plugin], undefined)).toBe(false);

    expect(
      isPropsEqual(
        { text: '', plugins: [{}] },
        {
          text: '',
          plugins: [{ remarks: [], rehypes: [], repairs: [], mappers: [], renders: [], slots: [] }],
        },
      ),
    ).toBe(true);
  });

  test('compares pluggable arrays by class, order, and deep tuple options', () => {
    expect(
      isPluggablesEqual(
        [plugin, [TestPlugin, { nested: { enabled: true } }] as TestPluggable],
        [plugin, [TestPlugin, { nested: { enabled: true } }] as TestPluggable],
      ),
    ).toBe(true);
    expect(
      isPluggablesEqual(
        [[TestPlugin, { nested: { enabled: true } }] as TestPluggable],
        [[TestPlugin, { nested: { enabled: false } }] as TestPluggable],
      ),
    ).toBe(false);
    expect(isPluggablesEqual([plugin], [replacementPlugin])).toBe(false);
    expect(isPluggablesEqual([plugin], [])).toBe(false);
    expect(isPluggablesEqual(Array<TestPluggable>(1), [plugin])).toBe(false);
    expect(isPluggablesEqual([plugin], [[TestPlugin, undefined] as unknown as TestPluggable])).toBe(
      true,
    );
    expect(isPluggablesEqual([plugin, replacementPlugin], [replacementPlugin, plugin])).toBe(false);
  });

  test('compares Fluxdown props by their rendered and plugin semantics', () => {
    const remark = [TestPlugin, { nested: { enabled: true } }] as TestPluggable;
    const base: FluxdownProps = {
      className: 'markdown',
      build: {},
      patches: [{ key: 'inline', range: [0, 2], render: renderPatch }],
      plugins: [
        {
          config: { [TestPlugin.key]: { nested: { enabled: true } } },
          remarks: [remark as IPluggable<IRemarkPlugin, unknown>],
        },
      ],
      style: { color: 'red' },
      text: 'content',
    };
    const equivalent = {
      className: 'markdown',
      build: {},
      patches: [{ key: 'inline', range: [0, 2], render: renderPatch }],
      plugins: [
        {
          config: { [TestPlugin.key]: { nested: { enabled: true } } },
          remarks: [
            [TestPlugin, { nested: { enabled: true } }] as unknown as IPluggable<
              IRemarkPlugin,
              unknown
            >,
          ],
        },
      ],
      style: { color: 'red' },
      text: 'content',
    } satisfies FluxdownProps;

    expect(isPropsEqual(base, equivalent)).toBe(true);
    expect(isPropsEqual({ ...base, plugins: Array<IPluginItem>(1) }, equivalent)).toBe(false);
    expect(isPropsEqual(base, { ...equivalent, text: 'changed' })).toBe(false);
    expect(isPropsEqual(base, { ...equivalent, className: 'changed' })).toBe(false);
    expect(isPropsEqual(base, { ...equivalent, style: { color: 'blue' } })).toBe(false);

    expect(isPropsEqual(base, { ...equivalent, build: { tex: true } })).toBe(false);
    expect(
      isPropsEqual(base, {
        ...equivalent,
        patches: [{ key: 'inline', range: [0, 2], render: () => null }],
      }),
    ).toBe(false);
    expect(
      isPropsEqual(base, {
        ...equivalent,
        plugins: [
          {
            config: { [TestPlugin.key]: { nested: { enabled: false } } },
            remarks: first(equivalent.plugins)?.remarks,
          },
        ],
      }),
    ).toBe(false);
  });

  test('compares single plugin packs with equivalent arrays and detects configuration changes', () => {
    const pack: IPluginItem = {
      config: { [TestPlugin.key]: { nested: { enabled: true } } },
      remarks: [TestPlugin as unknown as IPluggable<IRemarkPlugin, unknown>],
    };
    const base: FluxdownProps = { text: 'content', plugins: pack };
    const equivalent: IPluginItem = {
      ...pack,
      config: { [TestPlugin.key]: { nested: { enabled: true } } },
    };
    const changed: IPluginItem = {
      ...pack,
      config: { [TestPlugin.key]: { nested: { enabled: false } } },
    };

    expect(isPropsEqual(base, { ...base, plugins: equivalent })).toBe(true);
    expect(isPropsEqual(base, { ...base, plugins: [equivalent] })).toBe(true);
    expect(isPropsEqual({ ...base, plugins: [equivalent] }, base)).toBe(true);
    expect(isPropsEqual(base, { ...base, plugins: changed })).toBe(false);
    expect(isPropsEqual(base, { ...base, plugins: [changed] })).toBe(false);
    expect(isPropsEqual(base, { ...base, plugins: [] })).toBe(false);
    expect(isPropsEqual(base, { ...base, plugins: [pack, pack] })).toBe(false);
  });

  test('compares smoothing enablement and driver choices', () => {
    const base: FluxdownProps = { text: 'content' };

    const smooth: FluxdownProps = {
      ...base,
      streaming: { smooth: { enabled: true, driver: 'raf', interpolation: 'spring' } },
    };

    expect(isPropsEqual(base, { ...base, streaming: false })).toBe(true);

    expect(isPropsEqual(base, { ...base, streaming: true })).toBe(false);

    expect(
      isPropsEqual(smooth, {
        ...base,
        streaming: { smooth: { enabled: true, driver: 'raf', interpolation: 'spring' } },
      }),
    ).toBe(true);

    expect(
      isPropsEqual(smooth, {
        ...base,
        streaming: { smooth: { enabled: false, driver: 'raf', interpolation: 'spring' } },
      }),
    ).toBe(false);

    expect(
      isPropsEqual(smooth, {
        ...base,
        streaming: { smooth: { enabled: true, driver: 'interval', interpolation: 'spring' } },
      }),
    ).toBe(false);
  });

  test('compares streaming defaults and explicit overrides', () => {
    const base: FluxdownProps = { text: 'content', streaming: true };

    expect(isPropsEqual(base, { ...base, streaming: {} })).toBe(true);

    expect(
      isPropsEqual(base, {
        ...base,
        streaming: { repairEnding: true, smooth: true, effect: 'scale' },
      }),
    ).toBe(true);

    expect(isPropsEqual(base, { ...base, build: { repair: true } })).toBe(false);

    expect(isPropsEqual(base, { ...base, build: { repair: false } })).toBe(false);

    expect(isPropsEqual(base, { ...base, streaming: { repairEnding: false } })).toBe(false);

    expect(isPropsEqual(base, { ...base, streaming: { effect: false } })).toBe(false);

    expect(isPropsEqual(base, { ...base, streaming: { effect: 'shad' } })).toBe(false);

    expect(
      isPropsEqual(
        { ...base, streaming: { effect: true } },
        { ...base, streaming: { effect: 'scale' } },
      ),
    ).toBe(true);

    expect(
      isPropsEqual(base, { ...base, streaming: { effect: ['shad', { duration: 800 }] } }),
    ).toBe(false);

    expect(
      isPropsEqual(
        { text: 'content' },
        { text: 'content', streaming: { repairEnding: false, smooth: false, effect: false } },
      ),
    ).toBe(true);
  });

  test('short-circuits identical props before reading their values', () => {
    const props = new Proxy<FluxdownProps>(
      { text: 'content' },
      {
        get: () => {
          throw new Error('Prop values must not be read.');
        },
      },
    );

    expect(isPropsEqual(props, props)).toBe(true);
  });
});
