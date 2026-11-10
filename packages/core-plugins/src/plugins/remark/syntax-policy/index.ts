import type { Root as MdastRoot } from 'mdast';
import type { Extension } from 'micromark-util-types';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';

import { appendMicromarkExtension } from '../../../utils';
import { BaseRemarkPlugin } from '../base';

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
  static readonly key = 'remark-syntax-policy';

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Default,
  };

  private readonly innerConfig: SyntaxPolicyRemarkPluginInnerConfig;

  plugin: Plugin<[], MdastRoot, MdastRoot>;

  constructor(config: SyntaxPolicyRemarkPluginConfig = {}) {
    super();

    this.innerConfig = { ...config };

    const getOptions = () => ({
      indentedCode: this.innerConfig.indentedCode ?? this.context?.config.indentedCode ?? false,
      setextHeading: this.innerConfig.setextHeading ?? this.context?.config.setextHeading ?? false,
    });

    this.plugin = function () {
      const { indentedCode, setextHeading } = getOptions();

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
}
