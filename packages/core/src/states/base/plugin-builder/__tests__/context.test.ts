import type {
  IPluggable,
  IPluggableConfig,
  RemarkPluginConfigContext,
  RemarkPluginEnabledContext,
} from '@fluxdown/types';

import { BaseRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/base';
import { noop } from 'lodash-es';

import { buildPluggables, PluginCacheStore, preparePluggables, toPluggable } from '..';

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

describe('static pluggable hooks', () => {
  test('filters before preparation and preserves constructor defaults and static receivers', () => {
    const events: string[] = [];

    const constructed = jest.fn();

    const receivers: unknown[] = [];

    class ConditionalPlugin extends OptionsPlugin {
      constructor(options: UserOptions = { context: 'constructor default' }) {
        super(options);

        constructed(arguments.length);
      }

      static override enabled(context: RemarkPluginEnabledContext): boolean {
        const { config } = context;

        events.push('enabled');

        receivers.push(this);

        return config.tex;
      }

      static override prepareConfig(
        context: RemarkPluginConfigContext,
        outerConfig: IPluggableConfig<UserOptions>,
      ): IPluggableConfig<UserOptions> | null {
        const { config } = context;

        events.push('prepareConfig');

        receivers.push(this);

        return config.repairEnding ? { ...outerConfig, priority: 2 } : null;
      }
    }

    const context: RemarkPluginConfigContext = {
      config: {
        repair: true,
        repairEnding: false,
        tex: false,
        footnote: false,
        indentedCode: false,
        setextHeading: false,
        patches: [],
      },
      remarks: [],
      repairs: [],
    };

    const disabled: IPluggable<ConditionalPlugin, unknown> = [
      ConditionalPlugin,
      { disabled: true },
    ];

    expect(preparePluggables([disabled], context)).toEqual([]);

    expect(events).toEqual([]);

    expect(preparePluggables([ConditionalPlugin], context)).toEqual([]);

    expect(events).toEqual(['enabled']);

    const enabledContext = { ...context, config: { ...context.config, tex: true } };

    const enabled = preparePluggables([ConditionalPlugin], enabledContext);

    expect(enabled).toEqual([ConditionalPlugin]);

    expect(events).toEqual(['enabled', 'enabled', 'prepareConfig']);

    const plugin = buildPluggables(enabled[0]!);

    expect(constructed).toHaveBeenCalledWith(0);

    expect(plugin.options.context).toBe('constructor default');

    const options = { context: 'outer', priority: 7 };

    const entry: IPluggable<ConditionalPlugin, unknown> = [ConditionalPlugin, options];

    const configured = preparePluggables([entry], {
      ...enabledContext,
      config: { ...enabledContext.config, repairEnding: true },
    });

    const resolved = buildPluggables(configured[0]!);

    expect(resolved.options.context).toBe('outer');

    expect(resolved.config.priority).toBe(2);

    expect(options).toEqual({ context: 'outer', priority: 7 });

    expect(receivers.every((receiver) => receiver === ConditionalPlugin)).toBe(true);

    plugin.destroy();

    resolved.destroy();
  });
});
