import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairMarker, isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getIncompleteFenceValue } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-code-fence': IPluggableConfig<void>;
  }
}

export class IncompleteCodeFenceRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteCodeFence;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  override runner: RepairPluginRunner = ({ node, parents }) => {
    if (!isRepairNodeType(node, 'code') && !isRepairNodeType(node, 'text')) {
      return;
    }

    if (!isRepairTreeTail(node, parents)) {
      return;
    }

    if (isRepairNodeType(node, 'code')) {
      const value = getIncompleteFenceValue(node);

      if (value !== undefined) {
        node.value = value;
      }

      return;
    }

    const tail = /(?:^|\r\n|\r|\n)(`{1,2}|~{1,2})$/.exec(node.value);

    if (!tail || !tail[1]) {
      return;
    }

    const offset = node.value.length - tail[1].length;

    if (isRepairMarker(node, offset, tail[1].length)) {
      node.value = node.value.slice(0, offset);
    }
  };
}
