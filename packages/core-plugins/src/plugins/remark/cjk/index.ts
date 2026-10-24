import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { type IBasePluginConfig, type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { cjkFriendlyExtension } from 'micromark-extension-cjk-friendly';
import { gfmStrikethroughCjkFriendly } from 'micromark-extension-cjk-friendly-gfm-strikethrough';

import { appendMicromarkExtension } from '../../../utils';
import { BaseRemarkPlugin } from '../base';
import { splitCjkAutolinks } from './utils';

declare global {
  interface RemarkConfigs {
    'remark-cjk': IPluggableConfig<void>;
  }
}

export class CjkRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-cjk';

  readonly config: IBasePluginConfig = {
    // Select the tokenizer before the strikethrough plugin registers its extensions.
    priority: PluginPriority.Highest - 1,
  };

  plugin: Plugin<[], Root, Root> = function () {
    const data = this.data();

    appendMicromarkExtension(data, cjkFriendlyExtension());
    data.overrideStrikethrough = ({ singleTilde }) =>
      gfmStrikethroughCjkFriendly({ singleTilde: singleTilde ?? true });

    return (tree, file) => {
      const source = typeof file.value === 'string' ? file.value : '';

      splitCjkAutolinks(tree, source);
    };
  };
}
