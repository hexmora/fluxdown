import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { isMdastParent } from '@fluxdown/mdast';
import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairMarker } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { getIncompleteHtmlChildren, getIncompleteTagStart } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-html-tag': IPluggableConfig<void>;
  }
}

export class IncompleteHtmlTagRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-html-tag';

  readonly config: RepairPluginSystemConfig = {
    ending: false,
    priority: PluginPriority.Default,
    rightFirst: true,
  };

  runner: RepairPluginRunner = ({ node, parent, insertNext, break: stop }) => {
    if (isMdastParent(node)) {
      const children = getIncompleteHtmlChildren(node);

      if (children !== undefined) {
        node.children = children;

        stop();

        return;
      }

      if (node.children.length === 0) {
        stop();
      }

      return;
    }

    stop();

    if (node.type !== 'text' && node.type !== 'html') {
      return;
    }

    const start = getIncompleteTagStart(node.value);

    if (start === undefined || !isRepairMarker(node, start)) {
      return;
    }

    if (start === 0 && parent) {
      insertNext([], true);

      return;
    }

    node.value = node.value.slice(0, start);
  };
}
