import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin } from '../../../../base';
import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

declare global {
  interface ReactLynxRenderConfigs {
    'render-patch': IPluggableConfig<void>;
  }
}

const renderNode = ({ node, patches }: ReactLynxRenderParams) => {
  assert(isPatchNode(node));

  const patchText = node.properties.dataPatchText;

  return (
    <PatchReconciler
      patchKey={node.properties.dataPatchKey}
      patches={patches}
      text={isString(patchText) ? patchText : undefined}
    />
  );
};

export class PatchRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: ReactLynxRenderMatchParams) {
    return isPatchNode(node);
  }

  readonly render = renderNode;
}
