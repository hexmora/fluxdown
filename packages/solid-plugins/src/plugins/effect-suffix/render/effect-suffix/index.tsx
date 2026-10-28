import type { IPluggableConfig } from '@fluxdown/types';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import { assert } from '@fluxdown/utils';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';

const Suffix = /*#__PURE__*/ createTypeOfSlot('Suffix');

declare global {
  interface SolidRenderConfigs {
    'render-suffix': IPluggableConfig<void>;
  }
}

export class EffectSuffixRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-suffix';

  match({ node }: SolidRenderMatchParams) {
    return isSuffixNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isSuffixNode(props.node));

      return props.node;
    });

    const type = () => node().properties[SUFFIX_DATA_ATTR];

    return (
      <Show when={type() === 'cursor' || type() === 'dot'}>
        <Suffix type={type()} />
      </Show>
    );
  }
}
