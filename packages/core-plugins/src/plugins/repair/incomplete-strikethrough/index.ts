import type {
  RepairPluginConfigContext,
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import {
  isCompleteRepairPhrasingParent,
  isRepairNodeType,
  isRepairPhrasingParent,
  isRepairTreeTail,
} from '../../../utils';
import { RemarkPluginKeys } from '../../remark/keys';
import { getConfigIfEnabled } from '../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getIncompleteDelimiterChildren, isOpenRepairTableCell } from '../utils';

export type IncompleteStrikethroughRepairPluginConfig = {
  singleTilde?: boolean;
};

declare global {
  interface RepairConfigs {
    'repair-incomplete-strikethrough': IPluggableConfig<IncompleteStrikethroughRepairPluginConfig>;
  }
}

export class IncompleteStrikethroughRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteStrikethrough;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  private readonly singleTilde: boolean;

  constructor(config: IncompleteStrikethroughRepairPluginConfig = {}) {
    super();

    this.singleTilde = config.singleTilde ?? true;
  }

  static override config(
    { remarks }: RepairPluginConfigContext,
    outerConfig: IPluggableConfig<IncompleteStrikethroughRepairPluginConfig>,
  ): IPluggableConfig<IncompleteStrikethroughRepairPluginConfig> | null {
    const strikethrough = getConfigIfEnabled(remarks, RemarkPluginKeys.SyntaxStrikethrough);

    if (!strikethrough) {
      return null;
    }

    return { ...outerConfig, singleTilde: strikethrough.singleTilde !== false };
  }

  override enabled({ remarks }: RepairPluginEnabledContext): boolean {
    return getConfigIfEnabled(remarks, RemarkPluginKeys.SyntaxStrikethrough) !== undefined;
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

    const children = getIncompleteDelimiterChildren(
      node.children,
      'delete',
      this.singleTilde ? 1 : 2,
    );

    if (children) {
      node.children = children;
    }
  };
}
