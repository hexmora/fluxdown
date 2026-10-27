import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { SvelteRenderMatchParams, SvelteRenderParams } from '../../../../base';

import { BaseSvelteRenderPlugin, createElement } from '../../../../base';
import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

declare global {
  interface SvelteRenderConfigs {
    'render-patch': IPluggableConfig<void>;
  }
}

export class PatchRenderPlugin extends BaseSvelteRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: SvelteRenderMatchParams) {
    return isPatchNode(node);
  }

  render({ node, patches }: SvelteRenderParams) {
    assert(isPatchNode(node));

    const patchText = node.properties.dataPatchText;

    return createElement(PatchReconciler, {
      patchKey: node.properties.dataPatchKey,
      patches,
      text: isString(patchText) ? patchText : undefined,
    });
  }
}
