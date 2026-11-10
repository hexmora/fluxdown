import type { RepairPluginRunner, RepairPluginSystemConfig } from '@fluxdown/types';

import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { repairMath, SyntaxMathRemarkPlugin } from '../../remark/syntax-math';
import { getEnabledPluginConfig } from '../../utils';
import { BaseRepairPlugin } from '../base';

declare global {
  interface RepairConfigs {
    'repair-incomplete-math': IPluggableConfig<void>;
  }
}

export class IncompleteMathRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-incomplete-math';

  readonly config: RepairPluginSystemConfig = {
    scope: 'tail',
    ending: true,
    priority: PluginPriority.High,
  };

  isEnabled = () =>
    !this.context ||
    (this.context.config.tex &&
      Boolean(getEnabledPluginConfig(this.context.remarks, SyntaxMathRemarkPlugin)));

  runner: RepairPluginRunner = ({ node, skipTree }) => {
    if (node.type !== 'root') {
      return;
    }

    repairMath(node);

    skipTree();
  };
}
