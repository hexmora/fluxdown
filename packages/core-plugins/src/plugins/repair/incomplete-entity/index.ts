import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isCompleteRepairPhrasingParent, isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getIncompleteEntityCutoff } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-entity': IPluggableConfig<void>;
  }
}

export class IncompleteEntityRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteEntity;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Low,
  };

  override runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (isCompleteRepairPhrasingParent(node)) {
      skipTree();

      return;
    }

    if (!isRepairNodeType(node, 'text')) {
      return;
    }

    if (!isRepairTreeTail(node, parents)) {
      return;
    }

    const cutoff = getIncompleteEntityCutoff(node);

    if (cutoff !== undefined) {
      node.value = node.value.slice(0, cutoff);
    }
  };
}
