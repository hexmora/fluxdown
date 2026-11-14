import type { IPluggable } from '@fluxdown/types';

import { BaseRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/base';
import { noop } from 'lodash-es';
import { D, MutableState, render, S } from 'stative';

import { buildPluggables, PluginBuilder, PluginCacheStore, toPluggable } from '..';

interface UserOptions {
  context?: string;
}

class ContextPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-test-context';

  plugin = noop;

  constructor(public options: UserOptions = {}) {
    super();
  }
}

describe('framework plugin context', () => {
  test('treats omitted and explicit undefined contexts as the same cache input', () => {
    const store = new PluginCacheStore();

    const first = store.build([ContextPlugin, {}]);

    const second = store.build([ContextPlugin, {}, undefined]);

    expect(second).toBe(first);

    store.release(first, second);
  });

  test('injects metadata independently of constructor options and preserves it through overrides', () => {
    const context = { config: { tex: true }, remarks: [], repairs: [] };

    const plugins = toPluggable([[ContextPlugin, { context: 'user option' }, context]], []);

    const overridden = toPluggable([plugins, { [ContextPlugin.key]: { priority: 1 } }]);

    const plugin = buildPluggables(overridden[0]!);

    expect(plugin.options.context).toBe('user option');

    expect(plugin.context).toBe(context);

    expect(Object.getOwnPropertyDescriptor(plugin, 'context')?.writable).toBe(false);

    expect(plugin.config.priority).toBe(1);

    plugin.destroy();
  });

  test.each([false, true])(
    'reuses equal contexts and rebuilds changed contexts with cache=%s',
    (shared) => {
      const store = new PluginCacheStore();

      const firstContext = { config: { tex: true }, remarks: [], repairs: [] };

      const plugins = MutableState.of<IPluggable<ContextPlugin, unknown>[]>([
        [ContextPlugin, {}, firstContext],
      ]);

      const closure = render(
        S([PluginBuilder<ContextPlugin>, { plugins, cacheStore: D(shared ? store : undefined) }]),
      );

      const first = closure.value.value[0]!;

      const destroy = jest.spyOn(first, 'destroy');

      plugins.next([[ContextPlugin, {}, { ...firstContext }]]);

      expect(closure.value.value[0]).toBe(first);

      const changed = { ...firstContext, config: { tex: false } };

      plugins.next([[ContextPlugin, {}, changed]]);

      expect(closure.value.value[0]).not.toBe(first);

      expect(closure.value.value[0]?.context).toBe(changed);

      expect(destroy).toHaveBeenCalledTimes(1);

      closure.destroy();

      plugins.destroy();
    },
  );
});
