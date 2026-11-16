import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { isBoolean, last } from 'lodash-es';

import { isRepairNodeType, isRepairSourceTail, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { isIncompleteTaskMarker } from '../utils';
import { getIncompleteListParagraph, getListMarkerCutoff } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-list-marker': IPluggableConfig<void>;
  }
}

export class IncompleteListMarkerRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteListMarker;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    /*
     * Resolve list structure after tables and before inline repairs consume its source.
     */
    priority: (PluginPriority.Highest + PluginPriority.High) / 2,
  };

  override runner: RepairPluginRunner = ({ node, parents, insertNext }) => {
    if (!isRepairTreeTail(node, parents)) {
      return;
    }

    const pendingParagraph = isRepairNodeType(node, 'heading')
      ? getIncompleteListParagraph(node, parents)
      : undefined;

    if (pendingParagraph) {
      insertNext([pendingParagraph], true);

      return;
    }

    if (isRepairNodeType(node, 'list')) {
      const item = last(node.children);

      const paragraph = item?.children[0];

      const pendingTask =
        item?.children.length === 1 &&
        paragraph?.type === 'paragraph' &&
        (isIncompleteTaskMarker(paragraph, [item]) ||
          (isBoolean(item.checked) && paragraph.children.length === 0));

      if (!item || (item.children.length !== 0 && !pendingTask)) {
        return;
      }

      node.children.pop();

      if (node.children.length === 0) {
        insertNext([], true);
      }

      return;
    }

    if (node.type !== 'paragraph') {
      return;
    }

    const tail = last(node.children);

    if (!tail || tail.type !== 'text') {
      return;
    }

    const cutoff = getListMarkerCutoff(tail, node.children.length === 1);

    if (cutoff === undefined) {
      return;
    }

    if (
      /^\d{1,9}$/.test(tail.value.slice(cutoff).trim()) &&
      !isRepairSourceTail(tail, [node, ...parents])
    ) {
      return;
    }

    const value = tail.value.slice(0, cutoff);

    if (value.length === 0) {
      node.children.splice(node.children.length - 1, 1);

      return;
    }

    tail.value = value;
  };
}
