import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { getClosedParagraphChildren } from './utils';

declare global {
  interface RepairConfigs {
    'repair-paragraph-html-closure': IPluggableConfig<void>;
  }
}

export class ParagraphHtmlClosureRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.ParagraphHtmlClosure;

  override readonly config: RepairPluginSystemConfig = {
    ending: false,
    allows: 'paragraph',
    priority: PluginPriority.Low,
  };

  override runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (!isRepairNodeType(node, 'paragraph')) {
      return;
    }

    skipTree();

    if (isRepairTreeTail(node, parents)) {
      return;
    }

    const children = getClosedParagraphChildren(node);

    if (children) {
      node.children = children;
    }
  };
}
