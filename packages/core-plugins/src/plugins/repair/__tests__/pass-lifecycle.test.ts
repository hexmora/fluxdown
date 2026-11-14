import type { IRepairPlugin, RepairPluginCleanup } from '@fluxdown/types';
import type { Root } from 'mdast';

import { PluginPriority } from '@fluxdown/types';
import { noop } from 'lodash-es';

import { processRepairByPlugins } from '../../../utils';

const createPlugin = (events: string[], name: string): IRepairPlugin => ({
  config: { scope: 'tail' },
  prepare: () => {
    events.push(`prepare ${name}`);

    return () => {
      events.push(`cleanup ${name}`);
    };
  },
  runner: () => {
    events.push(`run ${name}`);
  },
  before: noop,
  after: noop,
  beforeEach: noop,
  afterEach: noop,
  destroy: noop,
});

const tree = (): Root => ({ type: 'root', children: [] });

describe('repair pass lifecycle', () => {
  test('prepares enabled plugins in priority order before running and releases in reverse order', () => {
    const events: string[] = [];

    const first = createPlugin(events, 'first');

    const second = createPlugin(events, 'second');

    const ending = createPlugin(events, 'ending');

    Object.assign(first, { config: { priority: PluginPriority.High } });

    Object.assign(ending, { config: { ending: true } });

    processRepairByPlugins({ node: tree(), plugins: [second, ending, first] });

    expect(events).toEqual([
      'prepare first',
      'prepare second',
      'run first',
      'run second',
      'cleanup second',
      'cleanup first',
    ]);
  });

  test('does not prepare or run a plugin disabled by its context', () => {
    const events: string[] = [];

    const plugin = createPlugin(events, 'disabled');

    plugin.isEnabled = () => false;

    processRepairByPlugins({ node: tree(), plugins: [plugin], ending: true });

    expect(events).toEqual([]);
  });

  test.each(['prepare', 'runner'] as const)(
    'releases prepared resources when %s throws',
    (phase) => {
      const events: string[] = [];

      const first = createPlugin(events, 'first');

      const second = createPlugin(events, 'second');

      second[phase] = () => {
        throw new Error(`failed ${phase}`);
      };

      expect(() =>
        processRepairByPlugins({
          node: tree(),
          plugins: [first, second],
          safe: false,
        }),
      ).toThrow(`failed ${phase}`);

      expect(events.at(-1)).toBe('cleanup first');
    },
  );

  test('releases every resource even if an earlier cleanup throws', () => {
    const events: string[] = [];

    const first = createPlugin(events, 'first');

    const second = createPlugin(events, 'second');

    second.prepare = (): RepairPluginCleanup => () => {
      throw new Error('failed cleanup');
    };

    expect(() =>
      processRepairByPlugins({
        node: tree(),
        plugins: [first, second],
        safe: false,
      }),
    ).toThrow('failed cleanup');

    expect(events.at(-1)).toBe('cleanup first');
  });
});
