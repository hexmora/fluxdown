import type { IRepairPlugin } from '@fluxdown/types';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { processRepairByPlugins } from '../../../utils';
import { BaseRemarkPlugin } from '../base';
import { captureSource } from '../utils';

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
  static readonly key = 'remark-apply-repairs';

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.High,
  };

  private readonly innerConfig: ApplyRepairsRemarkPluginInnerConfig;

  plugin: Plugin<[], Root, Root>;

  isEnabled = () => this.context?.config.repair !== false;

  constructor(config: ApplyRepairsRemarkPluginConfig = {}) {
    super();

    this.innerConfig = {
      plugins: [...(config.plugins ?? [])],
      ending: config.ending ?? false,
      safe: config.safe ?? true,
    };

    const getOptions = () => ({
      plugins: this.context?.repairs ?? this.innerConfig.plugins,
      ending: this.context?.config.repairEnding ?? this.innerConfig.ending,
      safe: this.innerConfig.safe,
    });

    this.plugin = function () {
      this.use(captureSource);

      const { plugins, ending, safe } = getOptions();

      return (tree) => {
        processRepairByPlugins({ node: tree, plugins, ending, safe });
      };
    };
  }
}
