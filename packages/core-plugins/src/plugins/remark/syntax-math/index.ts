import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import {
  type IBasePluginConfig,
  type IPluggableConfig,
  PluginPriority,
  type RemarkPluginConfigContext,
  type RemarkPluginEnabledContext,
} from '@fluxdown/types';
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';
import { math } from 'micromark-extension-math';

import type { SyntaxMathRemarkPluginConfig, SyntaxMathRemarkPluginInnerConfig } from './type';

import { appendRemarkExtensions } from '../../../utils';
import { getConfigIfEnabled } from '../../utils';
import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';
import { setTextSource } from '../utils';
import { transformMath } from './utils';

export type { PandocMathData, PandocMathMode } from '../../../typings';

export type { SyntaxMathRemarkPluginConfig } from './type';

export { repairMath, transformMath } from './utils';

declare global {
  interface RemarkConfigs {
    'remark-syntax-math': IPluggableConfig<void>;
  }
}

export class SyntaxMathRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.SyntaxMath;

  override readonly config: IBasePluginConfig = {
    priority: PluginPriority.Highest,
  };

  private readonly innerConfig: SyntaxMathRemarkPluginInnerConfig;

  override plugin: Plugin<[], Root, Root>;

  constructor(config: SyntaxMathRemarkPluginConfig = {}) {
    super();

    this.innerConfig = {
      repairEnding: config.repairEnding ?? false,
    };

    const { repairEnding } = this.innerConfig;

    this.plugin = function () {
      this.use(setTextSource);

      appendRemarkExtensions(this.data(), {
        micromark: math(),
        fromMarkdown: mathFromMarkdown(),
        toMarkdown: mathToMarkdown(),
      });

      return (tree) => {
        transformMath(tree, repairEnding);
      };
    };
  }

  static override prepareConfig(
    context: RemarkPluginConfigContext,
    outerConfig: IPluggableConfig<SyntaxMathRemarkPluginConfig>,
  ): IPluggableConfig<SyntaxMathRemarkPluginConfig> {
    const { config, remarks } = context;

    const repairEnabled = getConfigIfEnabled(remarks, RemarkPluginKeys.ApplyRepairs) !== undefined;

    return {
      ...outerConfig,
      repairEnding: config.repair && config.repairEnding && !repairEnabled,
    };
  }

  static override enabled(context: RemarkPluginEnabledContext): boolean {
    const { config } = context;

    return config.tex;
  }
}
