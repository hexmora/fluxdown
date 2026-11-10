import type { Root as MdastRoot } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import remarkBreaks from 'remark-breaks';

import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';

declare global {
  interface RemarkConfigs {
    'remark-syntax-soft-endline': IPluggableConfig<void>;
  }
}

export class SyntaxSoftEndlineRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.SyntaxSoftEndline;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Low,
  };

  plugin: Plugin<[], MdastRoot, MdastRoot> = remarkBreaks;
}
