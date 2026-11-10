import type {
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { isRepairMarker, isRepairNodeType, isRepairTreeTail } from '../../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { removeCompleteReferences, removeIncompleteReference } from './utils';

declare global {
  interface RepairConfigs {
    'repair-dangling-footnote': IPluggableConfig<void>;
  }
}

export class DanglingFootnoteRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.DanglingFootnote;

  override enabled({ config }: RepairPluginEnabledContext): boolean {
    return config.footnote;
  }

  override readonly config: RepairPluginSystemConfig = {
    ending: true,
    priority: PluginPriority.Low,
  };

  override runner: RepairPluginRunner = ({ node, parents, skipTree }) => {
    if (node.type === 'link' || node.type === 'linkReference') {
      skipTree();

      return;
    }

    if (!isRepairNodeType(node, 'text')) {
      return;
    }

    const isMarker = (offset: number, length: number) => isRepairMarker(node, offset, length);

    let value = node.value;

    if (isRepairTreeTail(node, parents)) {
      value = removeIncompleteReference(value, isMarker);
    }

    value = removeCompleteReferences(value, isMarker);

    if (value !== node.value) {
      node.value = value;
    }
  };
}
