import type { Root as MdastRoot } from 'mdast';
import type { Plugin } from 'unified';

import {
  type IBasePluginConfig,
  type IPluggableConfig,
  PluginPriority,
  type RemarkPluginEnabledContext,
} from '@fluxdown/types';
import { gfmFootnoteFromMarkdown, gfmFootnoteToMarkdown } from 'mdast-util-gfm-footnote';
import { gfmFootnote } from 'micromark-extension-gfm-footnote';

import { appendRemarkExtensions } from '../../../utils';
import { BaseRemarkPlugin } from '../base';
import { RemarkPluginKeys } from '../keys';

declare global {
  interface RemarkConfigs {
    'remark-syntax-footnote': IPluggableConfig<void>;
  }
}

export class SyntaxFootnoteRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = RemarkPluginKeys.SyntaxFootnote;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Highest,
  };

  plugin: Plugin<[], MdastRoot, MdastRoot> = function () {
    appendRemarkExtensions(this.data(), {
      micromark: gfmFootnote(),
      fromMarkdown: gfmFootnoteFromMarkdown(),
      toMarkdown: gfmFootnoteToMarkdown(),
    });
  };

  override enabled({ config }: RemarkPluginEnabledContext): boolean {
    return config.footnote;
  }
}
