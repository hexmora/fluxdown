import type {
  IRepairPlugin,
  RemarkPluginConfigContext,
  RemarkPluginEnabledContext,
} from '@fluxdown/types';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { processRepairByPlugins } from '../../../utils';
import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';
import { setTextSource } from '../utils';

export interface ApplyRepairsRemarkPluginConfig {
  plugins?: IRepairPlugin[];
  ending?: boolean;
  safe?: boolean;
}

type ApplyRepairsRemarkPluginInnerConfig = Required<ApplyRepairsRemarkPluginConfig>;

declare global {
  interface RemarkConfigs {
    'remark-apply-repairs': IPluggableConfig<Pick<ApplyRepairsRemarkPluginConfig, 'safe'>>;
  }
}

export class ApplyRepairsRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.ApplyRepairs;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.High,
  };

  private readonly innerConfig: ApplyRepairsRemarkPluginInnerConfig;

  plugin: Plugin<[], Root, Root>;

  constructor(config: ApplyRepairsRemarkPluginConfig = {}) {
    super();

    this.innerConfig = {
      plugins: [...(config.plugins ?? [])],
      ending: config.ending ?? false,
      safe: config.safe ?? true,
    };

    const { plugins, ending, safe } = this.innerConfig;

    this.plugin = function () {
      this.use(setTextSource);

      return (tree) => {
        processRepairByPlugins({ node: tree, plugins, ending, safe });
      };
    };
  }

  static override prepareConfig(
    context: RemarkPluginConfigContext,
    outerConfig: IPluggableConfig<ApplyRepairsRemarkPluginConfig>,
  ): IPluggableConfig<ApplyRepairsRemarkPluginConfig> {
    const { config, repairs } = context;

    return { ...outerConfig, plugins: repairs, ending: config.repairEnding };
  }

  static override enabled(context: RemarkPluginEnabledContext): boolean {
    const { config } = context;

    return config.repair;
  }
}
