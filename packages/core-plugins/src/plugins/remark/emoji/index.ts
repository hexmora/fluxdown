import type { Root as MdastRoot } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import remarkGemoji from 'remark-gemoji';

import { BaseRemarkPlugin } from '../base';

declare global {
  interface RemarkConfigs {
    'remark-emoji': IPluggableConfig<void>;
  }
}

export class EmojiRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-emoji';

  readonly config: IBasePluginConfig = {
    // Parse math from source positions before replacing text nodes with emoji.
    priority: PluginPriority.Lowest + 1,
  };

  plugin: Plugin<[], MdastRoot, MdastRoot> = remarkGemoji;
}
