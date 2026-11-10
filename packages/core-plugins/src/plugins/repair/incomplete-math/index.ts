import type {
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { RemarkPluginKeys } from '../../remark/keys';
import { repairMath } from '../../remark/syntax-math';
import { getConfigIfEnabled } from '../../utils';
import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';

declare global {
  interface RepairConfigs {
    'repair-incomplete-math': IPluggableConfig<void>;
  }
}

export class IncompleteMathRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.IncompleteMath;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.High,
  };

  override enabled({ config, remarks }: RepairPluginEnabledContext): boolean {
    return config.tex && getConfigIfEnabled(remarks, RemarkPluginKeys.SyntaxMath) !== undefined;
  }

  override runner: RepairPluginRunner = ({ node, skipTree }) => {
    if (node.type !== 'root') {
      return;
    }

    repairMath(node);

    skipTree();
  };
}
