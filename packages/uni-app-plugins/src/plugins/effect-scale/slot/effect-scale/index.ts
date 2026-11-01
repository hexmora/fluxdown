import type { IPluggableConfig } from '@fluxdown/types';

import type { SlotBaseProps } from '../../../../base/slot/type';

import { BaseSlotPlugin } from '../../../../base';
import { hasInlineEffect, mapInlineText } from '../../../../base/slot/utils/inline';
import { ScaleRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-scale': IPluggableConfig<void>;
  }
}

export class EffectScaleSlotPlugin extends BaseSlotPlugin<'Scale'> {
  static readonly key = 'slot-scale';

  readonly Component = ScaleRenderer;

  readonly type = 'Scale';

  renderInline(props: SlotBaseProps & Record<string, unknown>) {
    if (this.Component !== ScaleRenderer || hasInlineEffect(props.children ?? [])) {
      return null;
    }

    const effect = {
      type: 'scale' as const,
      start: Number(props.start),
      duration: Number(props.duration),
      from: Number(props.from),
      blur: Number(props.blur),
    };

    return mapInlineText(props.children ?? [], (text) => ({ text, effect }));
  }
}
