import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Parent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last, nth } from 'lodash-es';

import { getRepairSourceOffset, isRepairNodeType } from '../../../utils';
import { BaseRepairPlugin } from '../base';

declare global {
  interface RepairConfigs {
    'repair-trailing-escape': IPluggableConfig<void>;
  }
}

export class TrailingEscapeRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-trailing-escape';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Low,
  };

  runner: RepairPluginRunner = ({ node, parents }) => {
    if (!isRepairNodeType(node, 'text') || !this.isStructuralTail(node, parents)) {
      return;
    }

    const source = node.data?.source;

    if (source === undefined || !node.value.endsWith('\\')) {
      return;
    }

    const offset = getRepairSourceOffset(node, node.value.length - 1);

    if (offset === undefined) {
      return;
    }

    let trailingEscapes = 0;

    for (let index = offset; index >= 0 && nth(source, index) === '\\'; index -= 1) {
      trailingEscapes += 1;
    }

    if (trailingEscapes % 2 === 1) {
      node.value = node.value.slice(0, -1);
    }
  };

  private isStructuralTail(node: unknown, parents: Parent[]): boolean {
    let child = node;

    for (const parent of parents) {
      if (last(parent.children) !== child) {
        return false;
      }

      child = parent;
    }

    return true;
  }
}
