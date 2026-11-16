import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getTrailingEscapeValue } from './utils';

declare global {
  interface RepairConfigs {
    'repair-trailing-escape': IPluggableConfig<void>;
  }
}

export class TrailingEscapeRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.TrailingEscape;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Low,
  };

  override runner: RepairPluginRunner = ({ node, parents }) => {
    if (!isRepairNodeType(node, 'text') || !isRepairTreeTail(node, parents)) {
      return;
    }

    const value = getTrailingEscapeValue(node);

    if (value !== undefined) {
      node.value = value;
    }
  };
}
