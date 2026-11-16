import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { isOpenRepairTableCell } from '../utils';
import { getIncompleteInlineCodeChildren } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-inline-code': IPluggableConfig<void>;
  }
}

export class IncompleteInlineCodeRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteInlineCode;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.High,
  };

  override runner: RepairPluginRunner = ({ node, parents }) => {
    if (
      node.type !== 'paragraph' &&
      node.type !== 'heading' &&
      !isOpenRepairTableCell(node, parents)
    ) {
      return;
    }

    if (!('children' in node)) {
      return;
    }

    if (!isRepairTreeTail(node, parents)) {
      return;
    }

    const children = getIncompleteInlineCodeChildren(node);

    if (children) {
      node.children = children;
    }
  };
}
