import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { SyntaxTableRemarkPlugin } from '../../remark/syntax-table';
import { getEnabledPluginConfig } from '../../utils';
import { BaseRepairPlugin } from '../base';
import { retainOpenTableCellBoundary } from '../utils';
import { getIncompleteTableParagraph, isIncompleteTableSetext } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-table': IPluggableConfig<void>;
  }
}

export class IncompleteTableRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-table';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Highest,
  };

  isEnabled = (): boolean => {
    return (
      !this.context ||
      Boolean(getEnabledPluginConfig(this.context.remarks, SyntaxTableRemarkPlugin))
    );
  };

  prepare = retainOpenTableCellBoundary;

  runner: RepairPluginRunner = ({ node, parents }) => {
    if (node.type !== 'root' && node.type !== 'blockquote' && node.type !== 'listItem') {
      return;
    }

    if (isIncompleteTableSetext(node.children.at(-1), [node, ...parents])) {
      node.children.pop();

      return;
    }

    let index = node.children.length - 1;

    // A partial delimiter can already be parsed as a thematic break.
    if (node.children[index]?.type === 'thematicBreak') {
      index -= 1;
    }

    const paragraph = node.children[index];

    if (paragraph?.type !== 'paragraph') {
      return;
    }

    const replacement = getIncompleteTableParagraph(paragraph, node, parents);

    if (!replacement) {
      return;
    }

    node.children.splice(
      index,
      node.children.length - index,
      ...(replacement.children.length ? [replacement] : []),
    );
  };
}
