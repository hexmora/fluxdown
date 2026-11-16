import type { Root as HastRoot } from 'hast';
import type { Plugin } from 'unified';

import { isHastElement } from '@fluxdown/hast';
import {
  type IBasePluginConfig,
  type IPluggableConfig,
  PluginPriority,
  type RehypePluginContext,
} from '@fluxdown/types';
import { has, last } from 'lodash-es';

import { BaseRehypePlugin } from '../base';
import { RehypePluginKeys } from '../keys';

declare global {
  interface RehypeConfigs {
    'rehype-hoist-footnote': IPluggableConfig<void>;
  }
}

export class HoistFootnoteRehypePlugin extends BaseRehypePlugin {
  static readonly key = RehypePluginKeys.HoistFootnote;

  readonly config: IBasePluginConfig = {
    priority: PluginPriority.Lowest,
  };

  static override enabled(context: RehypePluginContext): boolean {
    const { config } = context;

    return config.footnote;
  }

  plugin: Plugin<[], HastRoot, HastRoot> = () => (tree) => {
    const lastChild = last(tree.children);

    if (!isHastElement(lastChild, 'section') || !has(lastChild.properties ?? {}, 'dataFootnotes')) {
      return;
    }

    const footnote = tree.children.pop();

    tree.data = { ...tree.data, footnote };
  };
}
