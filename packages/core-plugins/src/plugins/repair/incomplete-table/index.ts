import type {
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';
import type { Parent, RootContent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { RemarkPluginKeys } from '../../remark/keys';
import { getConfigIfEnabled } from '../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import {
  getIncompleteTableParagraph,
  isIncompleteTableSetext,
  retainOpenTableCellBoundary,
} from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-table': IPluggableConfig<void>;
  }
}

export class IncompleteTableRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteTable;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Highest,
  };

  override enabled({ remarks }: RepairPluginEnabledContext): boolean {
    return getConfigIfEnabled(remarks, RemarkPluginKeys.SyntaxTable) !== undefined;
  }

  override runner: RepairPluginRunner = ({ node, parents }) => {
    if (node.type !== 'root' && node.type !== 'blockquote' && node.type !== 'listItem') {
      return;
    }

    if (isIncompleteTableSetext(node.children.at(-1), [node, ...parents])) {
      node.children.pop();

      return;
    }

    let index = node.children.length - 1;

    /*
     * A partial delimiter can already be parsed as a thematic break.
     */
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

  override prepare(node: Parent | RootContent) {
    return retainOpenTableCellBoundary(node);
  }
}
