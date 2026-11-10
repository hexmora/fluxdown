import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';
import type { PhrasingContent } from 'mdast';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { last, nth } from 'lodash-es';

import { isRepairMarker, sliceRepairText } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { isOpenRepairTableCell } from '../utils';
import { getInlineCodeValue } from './utils';

declare global {
  interface RepairConfigs {
    'repair-incomplete-inline-code': IPluggableConfig<void>;
  }
}

export class IncompleteInlineCodeRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-inline-code';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.High,
  };

  runner: RepairPluginRunner = ({ node, parents }) => {
    if (
      node.type !== 'paragraph' &&
      node.type !== 'heading' &&
      !isOpenRepairTableCell(node, parents)
    ) {
      return;
    }

    if (!('children' in node)) {
      return;
    }

    let branch = node;

    for (const parent of parents) {
      if (last(parent.children) !== branch) {
        return;
      }

      branch = parent;
    }

    const { children } = node;

    for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
      const child = nth(children, childIndex);

      if (child?.type !== 'text') {
        continue;
      }

      for (let offset = 0; offset < child.value.length; offset += 1) {
        if (child.value.charAt(offset) !== '`') {
          continue;
        }

        let length = 1;

        while (child.value.charAt(offset + length) === '`') {
          length += 1;
        }

        if (!isRepairMarker(child, offset, length)) {
          offset += length - 1;

          continue;
        }

        const prefix = sliceRepairText(child, 0, offset);

        const value = getInlineCodeValue(node, childIndex, offset, length);

        if (!prefix || value === undefined) {
          return;
        }

        const replacement: PhrasingContent[] = [];

        if (prefix.value.length > 0) {
          replacement.push(prefix);
        }

        if (value.length > 0) {
          replacement.push({ type: 'inlineCode', value });
        }

        children.splice(childIndex, children.length - childIndex, ...replacement);

        return;
      }
    }
  };
}
