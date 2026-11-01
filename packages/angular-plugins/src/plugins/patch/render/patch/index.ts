import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import { BaseAngularRenderPlugin, createComponentNode } from '@fluxdown/angular-plugins/base';
import { PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

export class PatchRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: AngularRenderMatchParams) {
    return isPatchNode(node);
  }

  render({ node, patches }: AngularRenderParams) {
    assert(isPatchNode(node));

    const patchText = node.properties.dataPatchText;

    return createComponentNode(PatchReconciler, {
      patchKey: node.properties.dataPatchKey,
      patches,
      text: isString(patchText) ? patchText : undefined,
    });
  }
}
