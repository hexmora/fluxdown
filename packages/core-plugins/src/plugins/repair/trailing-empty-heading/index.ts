import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { isEmptyHeading } from './utils';

declare global {
  interface RepairConfigs {
    'repair-trailing-empty-heading': IPluggableConfig<void>;
  }
}

export class TrailingEmptyHeadingRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.TrailingEmptyHeading;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  override runner: RepairPluginRunner = ({ node, parent, parents, insertNext }) => {
    if (!isRepairNodeType(node, 'heading') || !parent || !isRepairTreeTail(node, parents)) {
      return;
    }

    if (!isEmptyHeading(node)) {
      return;
    }

    insertNext([], true);
  };
}
