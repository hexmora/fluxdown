import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin } from '../../../../base';
import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

declare global {
  interface UniRenderConfigs {
    'render-patch': IPluggableConfig<void>;
  }
}

export class PatchRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: UniRenderMatchParams) {
    return isPatchNode(node);
  }

  render({ node, patches }: UniRenderParams) {
    assert(isPatchNode(node));

    const patchText = node.properties.dataPatchText;

    return {
      component: PatchReconciler,

      props: {
        patchKey: node.properties.dataPatchKey,
        patches,
        text: isString(patchText) ? patchText : undefined,
      },
    };
  }
}
