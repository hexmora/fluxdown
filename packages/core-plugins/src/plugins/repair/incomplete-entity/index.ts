import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Parent, RootContent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last } from 'lodash-es';

import { isCompleteRepairPhrasingParent, isRepairNodeType } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { getIncompleteEntityCutoff } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-entity': IPluggableConfig<void>;
  }
}

export class IncompleteEntityRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-entity';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Low,
  };

  runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (isCompleteRepairPhrasingParent(node)) {
      skipTree();

      return;
    }

    if (!isRepairNodeType(node, 'text')) {
      return;
    }

    let branch: Parent | RootContent = node;

    for (const parent of parents) {
      if (last(parent.children) !== branch) {
        return;
      }

      branch = parent;
    }

    const cutoff = getIncompleteEntityCutoff(node);

    if (cutoff !== undefined) {
      node.value = node.value.slice(0, cutoff);
    }
  };
}
