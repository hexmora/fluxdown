import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { isMdastParent } from '@fluxdown/mdast';
import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getAdjacentTextChildren } from './utils';

declare global {
  interface RepairConfigs {
    'repair-adjacent-text': IPluggableConfig<void>;
  }
}

export class AdjacentTextRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.AdjacentText;

  override readonly config: RepairPluginSystemConfig = {
    ending: false,
    priority: PluginPriority.Lowest,
  };

  override runner: RepairPluginRunner = ({ node }) => {
    if (!isMdastParent(node)) {
      return;
    }

    const children = getAdjacentTextChildren(node.children);

    if (children) {
      node.children = children;
    }
  };
}
