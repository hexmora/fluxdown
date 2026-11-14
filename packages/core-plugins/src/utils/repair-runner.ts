import type { IRepairPlugin, RepairPluginCleanup } from '@fluxdown/types';
import type { OmitWithType } from '@fluxdown/utils';
import type { Parent, Root, RootContent } from 'mdast';

import {
  processMdast,
  type ProcessMdastParams,
  type ProcessMdastRunnerParams,
} from '@fluxdown/mdast';
import { PluginPriority } from '@fluxdown/types';
import { isFunction } from 'lodash-es';

import { RepairSourceTracker } from './repair-source';

type RepairProcessOptions<T extends Parent | RootContent> = OmitWithType<
  ProcessMdastParams<T>,
  'node' | 'runner'
>;

const getPluginName = (plugin: IRepairPlugin) => {
  return plugin.constructor?.name ?? 'Unnamed';
};

interface RepairPluginExecution<T extends Parent | RootContent> {
  /**
   * Repair plugin being executed.
   */
  plugin: IRepairPlugin;

  /**
   * Root node for the current repair pass.
   */
  node: T;

  /**
   * Whether plugin errors should be swallowed and logged.
   * @default true
   */
  safe?: boolean;
}

export type RunRepairPluginParams<T extends Parent | RootContent> = RepairPluginExecution<T> &
  RepairProcessOptions<T>;

export const runRepairPlugin = <T extends Parent | RootContent>({
  plugin,
  node,
  safe = true,
  ...processOptions
}: RunRepairPluginParams<T>) => {
  const runners = isFunction(plugin.runner) ? [plugin.runner] : [...plugin.runner];

  const { ending: _ending, priority: _priority, ...pluginOptions } = plugin.config;

  const options = { ...processOptions, ...pluginOptions };

  const { scope, order = 'pre', rightFirst = false } = options;

  const tailOnly = scope === 'tail' && order === 'pre' && !rightFirst;

  plugin.before(node);

  for (const original of runners) {
    plugin.beforeEach(node);

    const runner = original.bind(plugin);

    const handleRunner = (params: ProcessMdastRunnerParams<T>) => {
      const tracker = new RepairSourceTracker(params);

      try {
        runner({
          ...params,
          insertNext(content, replaceCurrent) {
            params.insertNext(content, replaceCurrent);

            tracker.recordInsertions(content);
          },
          recursive(nextNode) {
            tracker.runRecursive(nextNode, () => {
              runRepairPlugin<Parent>({ plugin, node: nextNode, safe, ...processOptions });
            });
          },
        });
      } finally {
        tracker.invalidate();
      }
    };

    try {
      processMdast({
        node,
        runner: handleRunner,
        ...options,
        scope: tailOnly ? 'tail' : 'tree',
      });
    } catch (error) {
      if (!safe) {
        throw error;
      }

      console.error(`[Repair plugin error: ${getPluginName(plugin)}]`, error);
    }

    plugin.afterEach(node);
  }

  plugin.after(node);
};

interface RepairPluginPass {
  /**
   * Repair plugins to execute.
   */
  plugins: IRepairPlugin[];

  /**
   * Enables plugins that only run in ending repair mode.
   * @default false
   */
  ending?: boolean;
}

export type ProcessRepairByPluginsParams<T extends Parent | RootContent = Root> = RepairPluginPass &
  OmitWithType<RunRepairPluginParams<T>, 'plugin'>;

const releaseRepairPass = (cleanups: RepairPluginCleanup[]): void => {
  const errors: unknown[] = [];

  for (let index = cleanups.length - 1; index >= 0; index -= 1) {
    try {
      cleanups[index]?.();
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw errors[0];
  }
};

export const processRepairByPlugins = <T extends Parent | RootContent>({
  node,
  plugins,
  ending = false,
  safe,
  ...processOptions
}: ProcessRepairByPluginsParams<T>) => {
  const orderedPlugins = [...plugins];

  // oxlint-disable-next-line unicorn/no-array-sort -- ES2022 has no non-mutating native sort.
  orderedPlugins.sort(
    (left, right) =>
      (left.config.priority ?? PluginPriority.Default) -
      (right.config.priority ?? PluginPriority.Default),
  );

  const currentPlugins = orderedPlugins.filter((item) => {
    const { ending: endingOnly = false } = item.config;

    return item.isEnabled?.() !== false && (!endingOnly || ending);
  });

  const cleanups: RepairPluginCleanup[] = [];

  try {
    for (const plugin of currentPlugins) {
      const cleanup = plugin.prepare?.(node);

      if (cleanup) {
        cleanups.push(cleanup);
      }
    }

    for (const plugin of currentPlugins) {
      runRepairPlugin({
        plugin,
        node,
        safe,
        ...processOptions,
      });
    }
  } finally {
    releaseRepairPass(cleanups);
  }
};
