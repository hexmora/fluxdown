import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { PhrasingContent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last } from 'lodash-es';

import {
  isCompleteRepairPhrasingParent,
  isRepairMarker,
  isRepairNodeType,
  isRepairPhrasingParent,
  isRepairTreeTail,
} from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getIncompleteResource, isOpenRepairTableCell } from '../utils';
import { getResourceLabel } from './utils';

export type IncompleteImageRepairPluginConfig = {
  strategy?: 'discard' | 'placeholder';
};

type IncompleteImageRepairPluginInnerConfig = Required<IncompleteImageRepairPluginConfig>;

declare global {
  interface RepairConfigs {
    'repair-incomplete-image': IPluggableConfig<IncompleteImageRepairPluginConfig>;
  }
}

export class IncompleteImageRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteImage;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  private readonly innerConfig: IncompleteImageRepairPluginInnerConfig;

  constructor(config: IncompleteImageRepairPluginConfig = {}) {
    super();

    this.innerConfig = {
      strategy: config.strategy ?? 'placeholder',
    };
  }

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

    const tail = last(node.children);

    if (
      tail?.type === 'text' &&
      /(?:^|[\r\n])[ \t]*!$/.test(tail.value) &&
      isRepairMarker(tail, tail.value.length - 1)
    ) {
      const value = tail.value.slice(0, -1);

      node.children.splice(
        node.children.length - 1,
        1,
        ...(value ? [{ type: 'text' as const, value }] : []),
      );

      return;
    }

    const candidate = getIncompleteResource(node, true);

    if (!candidate) {
      return;
    }

    const replacement: PhrasingContent[] = [...candidate.prefix];

    if (this.innerConfig.strategy === 'placeholder') {
      replacement.push({
        type: 'image',
        url: '',
        alt: getResourceLabel(candidate.label) || 'image',
      });
    }

    node.children.splice(0, node.children.length, ...replacement);
  };
}
