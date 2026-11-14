import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Parent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last } from 'lodash-es';

import {
  isCompleteRepairPhrasingParent,
  isRepairNodeType,
  isRepairPhrasingParent,
} from '../../../utils';
import { SyntaxStrikethroughRemarkPlugin } from '../../remark/syntax-strikethrough';
import { getEnabledPluginConfig } from '../../utils';
import { BaseRepairPlugin } from '../base';
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
  static readonly key = 'repair-incomplete-strikethrough';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  private readonly singleTilde: boolean;

  isEnabled = () =>
    !this.context ||
    getEnabledPluginConfig(this.context.remarks, SyntaxStrikethroughRemarkPlugin) !== undefined;

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

    const syntax = this.context
      ? getEnabledPluginConfig(this.context.remarks, SyntaxStrikethroughRemarkPlugin)
      : undefined;

    const singleTilde = syntax ? syntax.singleTilde !== false : this.singleTilde;

    const children = getIncompleteDelimiterChildren(node.children, 'delete', singleTilde ? 1 : 2);

    if (children) {
      node.children = children;
    }
  };

  constructor(config: IncompleteStrikethroughRepairPluginConfig = {}) {
    super();

    this.singleTilde = config.singleTilde ?? true;
  }
}
