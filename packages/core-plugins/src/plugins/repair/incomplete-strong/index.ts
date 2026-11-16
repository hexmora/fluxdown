import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import {
  isCompleteRepairPhrasingParent,
  isRepairNodeType,
  isRepairPhrasingParent,
  isRepairTreeTail,
} from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getIncompleteDelimiterChildren, isOpenRepairTableCell } from '../utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-strong': IPluggableConfig<void>;
  }
}

export class IncompleteStrongRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteStrong;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  override runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (isCompleteRepairPhrasingParent(node)) {
      skipTree();

      return;
    }

    if (
      !isRepairPhrasingParent(node) &&
      !(isRepairNodeType(node, 'tableCell') && isOpenRepairTableCell(node, parents))
    ) {
      return;
    }

    if (!isRepairTreeTail(node, parents)) {
      return;
    }

    const children = getIncompleteDelimiterChildren(node.children, 'strong');

    if (children) {
      node.children = children;
    }
  };
}
