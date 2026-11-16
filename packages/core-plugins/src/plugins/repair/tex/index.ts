import type {
  IPluggableConfig,
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { PluginPriority } from '@fluxdown/types';

import type { TexRender } from './type';

import { BaseRepairPlugin } from '../base';
import { RepairPluginKeys } from '../keys';
import { renderTex, TexPrefixCache } from './utils';

export type { TexMode, TexRender } from './type';

declare global {
  interface RepairConfigs {
    'repair-tex': IPluggableConfig<TexRepairPluginConfig>;
  }
}

export interface TexRepairPluginConfig {
  render?: TexRender;
}

export class TexRepairPlugin extends BaseRepairPlugin {
  static readonly key = RepairPluginKeys.Tex;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tree',
    ending: true,
    priority: PluginPriority.Low,
  };

  private cache: TexPrefixCache;

  constructor({ render = renderTex }: TexRepairPluginConfig = {}) {
    super();

    this.cache = this.clearable(new TexPrefixCache(render));
  }

  static override enabled(context: RepairPluginEnabledContext): boolean {
    const { config } = context;

    return config.tex;
  }

  override runner: RepairPluginRunner = ({ node }) => {
    if (
      (node.type !== 'inlineMath' && node.type !== 'math') ||
      !('value' in node) ||
      node.data?.repairEnding !== true
    ) {
      return;
    }

    const mode =
      node.type === 'math' || node.data.pandocMath?.mode === 'display' ? 'display' : 'inline';

    const tex = this.cache.parse(node.value, mode);

    node.value = tex;

    node.data = {
      ...node.data,
      hChildren: [{ type: 'text', value: tex, data: { repairEnding: true } }],
    };

    delete node.data.source;
  };
}
