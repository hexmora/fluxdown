import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairMarker, isRepairNodeType } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { isStructuralTail, removeCompleteReferences, removeIncompleteReference } from './utils';

declare global {
  interface RepairConfigs {
    'repair-dangling-footnote': IPluggableConfig<void>;
  }
}

export class DanglingFootnoteRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-dangling-footnote';

  isEnabled = () => this.context?.config.footnote !== false;

  readonly config: RepairPluginSystemConfig = {
    ending: true,
    priority: PluginPriority.Low,
  };

  runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (node.type === 'link' || node.type === 'linkReference') {
      skipTree();

      return;
    }

    if (!isRepairNodeType(node, 'text')) {
      return;
    }

    const isMarker = (offset: number, length: number) => isRepairMarker(node, offset, length);

    let value = node.value;

    if (isStructuralTail(node, parents)) {
      value = removeIncompleteReference(value, isMarker);
    }

    value = removeCompleteReferences(value, isMarker);

    if (value !== node.value) {
      node.value = value;
    }
  };
}
