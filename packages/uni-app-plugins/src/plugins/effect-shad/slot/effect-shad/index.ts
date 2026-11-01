import type { IPluggableConfig } from '@fluxdown/types';

import type { SlotBaseProps } from '../../../../base/slot/type';
import type { UniRenderNode } from '../../../../typings/render';

import { BaseSlotPlugin } from '../../../../base';
import { getInlineText, hasInlineEffect, mapInlineText } from '../../../../base/slot/utils/inline';
import { ShadRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-shad': IPluggableConfig<void>;
  }
}

export class EffectShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'slot-shad';

  readonly Component = ShadRenderer;

  readonly type = 'Shad';

  renderInline(props: SlotBaseProps & Record<string, unknown>) {
    if (this.Component !== ShadRenderer) {
      return null;
    }

    const leading = props.leading as UniRenderNode;

    const active = props.active as UniRenderNode;

    if (hasInlineEffect([leading, active])) {
      return null;
    }

    const text = getInlineText(active);

    const maskText = props.isActive ? text : '';

    let cursor = 0;

    return [
      leading,
      ...mapInlineText([active], (value) => {
        cursor += value.length;

        return {
          text: value,
          ...(maskText
            ? {
                effect: {
                  type: 'shad' as const,
                  maskText,
                  trailingText: text.slice(cursor),
                },
              }
            : {}),
        };
      }),
    ];
  }
}
