import { BaseRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/base';
import { noop } from 'lodash-es';

import { buildPluggables, PluginCacheStore, toPluggable } from '..';

interface UserOptions {
  context?: string;
}

class OptionsPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-test-options';

  plugin = noop;

  constructor(public options: UserOptions = {}) {
    super();
  }
}

describe('ordinary plugin constructor options', () => {
  test('preserves user options through overrides without installing instance context', () => {
    const plugins = toPluggable([[OptionsPlugin, { context: 'user option' }]], []);

    const overridden = toPluggable([plugins, { [OptionsPlugin.key]: { priority: 1 } }]);

    const plugin = buildPluggables(overridden[0]!);

    expect(plugin.options.context).toBe('user option');

    expect(plugin).not.toHaveProperty('context');

    expect(plugin.config.priority).toBe(1);

    plugin.destroy();
  });

  test('shares equal constructor configuration and distinguishes changed options', () => {
    const store = new PluginCacheStore();

    const first = store.build([OptionsPlugin, { context: 'first' }]);

    const same = store.build([OptionsPlugin, { context: 'first' }]);

    const changed = store.build([OptionsPlugin, { context: 'changed' }]);

    expect(same).toBe(first);

    expect(changed).not.toBe(first);

    expect(changed.options.context).toBe('changed');

    store.release(first, same, changed);
  });
});
