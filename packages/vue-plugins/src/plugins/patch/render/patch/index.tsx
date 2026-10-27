import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { VueRenderMatchParams, VueRenderParams } from '../../../../base';

import { BaseVueRenderPlugin } from '../../../../base';
import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

declare global {
  interface VueRenderConfigs {
    'render-patch': IPluggableConfig<void>;
  }
}

export class PatchRenderPlugin extends BaseVueRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: VueRenderMatchParams) {
    return isPatchNode(node);
  }

  render({ node, patches }: VueRenderParams) {
    assert(isPatchNode(node));

    const patchText = node.properties.dataPatchText;

    return (
      <PatchReconciler
        patchKey={node.properties.dataPatchKey}
        patches={patches}
        text={isString(patchText) ? patchText : undefined}
      />
    );
  }
}
