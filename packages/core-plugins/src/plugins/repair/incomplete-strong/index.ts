import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Parent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last } from 'lodash-es';

import {
  isCompleteRepairPhrasingParent,
  isRepairNodeType,
  isRepairPhrasingParent,
} from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { getIncompleteDelimiterChildren, isOpenRepairTableCell } from '../utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-strong': IPluggableConfig<void>;
  }
}

export class IncompleteStrongRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-strong';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
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

    let branch: Parent = node;

    for (const parent of parents) {
      if (last(parent.children) !== branch) {
        return;
      }

      branch = parent;
    }

    const children = getIncompleteDelimiterChildren(node.children, 'strong');

    if (children) {
      node.children = children;
    }
  };
}
