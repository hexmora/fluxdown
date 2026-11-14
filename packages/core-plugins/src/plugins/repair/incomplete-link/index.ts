import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { Parent, PhrasingContent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last } from 'lodash-es';

import {
  isCompleteRepairPhrasingParent,
  isRepairNodeType,
  isRepairPhrasingParent,
} from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { getIncompleteResource, isIncompleteTaskMarker, isOpenRepairTableCell } from '../utils';
import { getIncompleteAutolinkChildren, getPendingReferenceTree } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-link': IPluggableConfig<void>;
  }
}

export class IncompleteLinkRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-link';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.Default,
  };

  runner: RepairPluginRunner[] = [
    ({ node, skipTree }) => {
      if (node.type === 'root' && 'children' in node) {
        const children = getPendingReferenceTree(node);

        if (children) {
          node.children = children;
        }

        skipTree();
      }
    },
    ({ node, parents, skipTree }) => {
      if (isCompleteRepairPhrasingParent(node)) {
        skipTree();

        return;
      }

      if (
        (!isRepairPhrasingParent(node) &&
          !(isRepairNodeType(node, 'tableCell') && isOpenRepairTableCell(node, parents))) ||
        node.type === 'link' ||
        parents.some((parent) => parent.type === 'link') ||
        isIncompleteTaskMarker(node, parents)
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

      const candidate = getIncompleteResource(node, false);

      if (!candidate) {
        const autolink = getIncompleteAutolinkChildren(node, parents);

        if (autolink) {
          node.children.splice(0, node.children.length, ...autolink);
        }

        return;
      }

      const replacement: PhrasingContent[] = [...candidate.prefix];

      if (candidate.label.length > 0) {
        replacement.push({ type: 'link', url: '#', title: null, children: candidate.label });
      }

      node.children.splice(0, node.children.length, ...replacement);
    },
  ];
}
