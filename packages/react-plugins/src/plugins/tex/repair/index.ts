import type {
  IPluggableConfig,
  RepairPluginEnabledContext,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { BaseRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/base';
import { PluginPriority } from '@fluxdown/types';

import type { TexRender } from './type';

import { TexPrefixCache } from './cache';

export type { TexMode, TexRender } from './type';

export enum TexRepairPluginKeys {
  Tex = 'repair-tex',
}

declare global {
  interface RepairConfigs {
    'repair-tex': IPluggableConfig<TexRepairPluginConfig>;
  }
}

export interface TexRepairPluginConfig {
  render?: TexRender;
}

export class TexRepairPlugin extends BaseRepairPlugin {
  static readonly key = TexRepairPluginKeys.Tex;

  override readonly config: RepairPluginSystemConfig = {
    scope: 'tree',
    ending: true,
    priority: PluginPriority.Low,
  };

  private cache: TexPrefixCache | undefined;

  constructor({ render }: TexRepairPluginConfig = {}) {
    super();

    if (render) {
      this.cache = this.clearable(new TexPrefixCache(render));
    }
  }

  override enabled({ config }: RepairPluginEnabledContext): boolean {
    return config.tex && this.cache !== undefined;
  }

  override runner: RepairPluginRunner = ({ node }) => {
    if (
      !this.cache ||
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
