import type { Root as MdastRoot } from 'mdast';
import type { Extension } from 'micromark-util-types';
import type { Plugin } from 'unified';

import {
  type IBasePluginConfig,
  type IPluggableConfig,
  PluginPriority,
  type RemarkPluginConfigContext,
} from '@fluxdown/types';

import { appendMicromarkExtension } from '../../../utils';
import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';

export interface SyntaxPolicyRemarkPluginConfig {
  indentedCode?: boolean;

  setextHeading?: boolean;
}

type SyntaxPolicyRemarkPluginInnerConfig = SyntaxPolicyRemarkPluginConfig;

declare global {
  interface RemarkConfigs {
    'remark-syntax-policy': IPluggableConfig<SyntaxPolicyRemarkPluginConfig>;
  }
}

export class SyntaxPolicyRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.SyntaxPolicy;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Default,
  };

  private readonly innerConfig: SyntaxPolicyRemarkPluginInnerConfig;

  plugin: Plugin<[], MdastRoot, MdastRoot>;

  constructor(config: SyntaxPolicyRemarkPluginConfig = {}) {
    super();

    this.innerConfig = { ...config };

    const { indentedCode = false, setextHeading = false } = this.innerConfig;

    this.plugin = function () {
      const disabledConstructs: string[] = [];

      if (!indentedCode) {
        disabledConstructs.push('codeIndented');
      }

      if (!setextHeading) {
        disabledConstructs.push('setextUnderline');
      }

      const extension: Extension = {
        disable: {
          null: [...disabledConstructs],
        },
      };

      appendMicromarkExtension(this.data(), extension);
    };
  }

  static override config(
    { config }: RemarkPluginConfigContext,
    outerConfig: IPluggableConfig<SyntaxPolicyRemarkPluginConfig>,
  ): IPluggableConfig<SyntaxPolicyRemarkPluginConfig> {
    return {
      indentedCode: config.indentedCode,
      setextHeading: config.setextHeading,
      ...outerConfig,
    };
  }
}
