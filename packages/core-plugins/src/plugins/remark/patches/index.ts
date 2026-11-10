import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import {
  type IBasePluginConfig,
  type IPluggableConfig,
  PluginPriority,
  type RemarkPluginConfigContext,
} from '@fluxdown/types';
import { cloneDeep, isString } from 'lodash-es';

import type { PatchesRemarkPluginConfig } from './type';

import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';
import { applyPatches } from './utils';

export type { PatchesRemarkPluginConfig } from './type';
export type { ParserPatch, ParserPatchData, ParserPatchProperties } from '../../../typings';

declare global {
  interface RemarkConfigs {
    'remark-patches': IPluggableConfig<void>;
  }
}

export class PatchesRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.Patches;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Highest,
  };

  private readonly innerConfig: PatchesRemarkPluginConfig;

  plugin: Plugin<[], Root, Root>;

  constructor(config: PatchesRemarkPluginConfig = {}) {
    super();

    this.innerConfig = cloneDeep(config);

    this.plugin = () => {
      return (tree, file) => {
        const patches = this.innerConfig.patches;

        if (!patches || patches.length === 0) {
          return;
        }

        const source = isString(file?.value) ? file.value : '';

        applyPatches(tree, patches, source);
      };
    };
  }

  static override config(
    { config }: RemarkPluginConfigContext,
    outerConfig: IPluggableConfig<PatchesRemarkPluginConfig>,
  ): IPluggableConfig<PatchesRemarkPluginConfig> {
    return { ...outerConfig, patches: config.patches };
  }
}
