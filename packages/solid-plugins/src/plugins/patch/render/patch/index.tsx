import { type IPluggableConfig, PluginPriority } from '@fluxdown/types';
import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin } from '../../../../base';
import { PatchReconciler } from './components/patch-reconciler';
import { isPatchNode } from './utils';

declare global {
  interface SolidRenderConfigs {
    'render-patch': IPluggableConfig<void>;
  }
}

export class PatchRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-patch';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: SolidRenderMatchParams) {
    return isPatchNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isPatchNode(props.node));

      return props.node;
    });

    const text = () => {
      const value = node().properties.dataPatchText;

      return isString(value) ? value : undefined;
    };

    return (
      <PatchReconciler
        patchKey={node().properties.dataPatchKey}
        patches={props.patches}
        text={text()}
      />
    );
  }
}
