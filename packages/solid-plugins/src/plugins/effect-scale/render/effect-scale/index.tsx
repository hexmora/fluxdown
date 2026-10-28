import type { IPluggableConfig } from '@fluxdown/types';

import { SCALE_DATA_ATTR, SCALE_WORD_VALUE } from '@fluxdown/core-plugins/plugins/mapper/scale';
import { assert } from '@fluxdown/utils';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';
import { getScaleConfig, isScaleNode } from './utils';

const Scale = /*#__PURE__*/ createTypeOfSlot('Scale');

const ScaleWord = /*#__PURE__*/ createTypeOfSlot('ScaleWord');

declare global {
  interface SolidRenderConfigs {
    'render-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-scale';

  match({ node }: SolidRenderMatchParams) {
    return isScaleNode(node);
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isScaleNode(props.node));

      return props.node;
    });

    return (
      <Show
        when={node().properties[SCALE_DATA_ATTR] === SCALE_WORD_VALUE}
        fallback={<Scale {...getScaleConfig(node())}>{props.renderChildren()}</Scale>}
      >
        <ScaleWord>{props.renderChildren()}</ScaleWord>
      </Show>
    );
  }
}
