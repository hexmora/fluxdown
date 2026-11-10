import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';
import { math } from 'micromark-extension-math';

import type { SyntaxMathRemarkPluginConfig, SyntaxMathRemarkPluginInnerConfig } from './type';

import { appendRemarkExtensions } from '../../../utils';
import { getEnabledPluginConfig } from '../../utils';
import { ApplyRepairsRemarkPlugin } from '../apply-repairs';
import { BaseRemarkPlugin } from '../base';
import { captureSource } from '../utils';
import { transformMath } from './transform';

export type { PandocMathData, PandocMathMode } from '../../../typings';

export type { SyntaxMathRemarkPluginConfig } from './type';

export { repairMath, transformMath } from './transform';

declare global {
  interface RemarkConfigs {
    'remark-syntax-math': IPluggableConfig<void>;
  }
}

export class SyntaxMathRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-syntax-math';

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Highest,
  };

  private readonly innerConfig: SyntaxMathRemarkPluginInnerConfig;

  plugin: Plugin<[], Root, Root>;

  isEnabled = () => !this.context || this.context.config.tex;

  constructor(config: SyntaxMathRemarkPluginConfig = {}) {
    super();

    this.innerConfig = {
      repairEnding: config.repairEnding ?? false,
    };

    const getRepairEnding = () => {
      const { context, innerConfig } = this;

      return context
        ? context.config.repair &&
            context.config.repairEnding &&
            !getEnabledPluginConfig(context.remarks, ApplyRepairsRemarkPlugin)
        : innerConfig.repairEnding;
    };

    this.plugin = function () {
      this.use(captureSource);

      appendRemarkExtensions(this.data(), {
        micromark: math(),
        fromMarkdown: mathFromMarkdown(),
        toMarkdown: mathToMarkdown(),
      });

      const repairEnding = getRepairEnding();

      return (tree) => {
        transformMath(tree, repairEnding);
      };
    };
  }
}
