import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';

declare global {
  interface RepairConfigs {
    'repair-trailing-empty-code-block': IPluggableConfig<void>;
  }
}

export class TrailingEmptyCodeBlockRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.TrailingEmptyCodeBlock;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  override runner: RepairPluginRunner = ({ node, parent, parents, insertNext }) => {
    if (!isRepairNodeType(node, 'code') || !parent || !isRepairTreeTail(node, parents)) {
      return;
    }

    if (node.value.length > 0 || (node.lang ?? '').length > 0 || (node.meta ?? '').length > 0) {
      return;
    }

    insertNext([], true);
  };
}
