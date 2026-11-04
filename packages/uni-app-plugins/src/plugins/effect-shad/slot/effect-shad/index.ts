import type { IPluggableConfig } from '@fluxdown/types';

import type { SlotBaseProps } from '../../../../base/slot/type';

import { BaseSlotPlugin } from '../../../../base';
import { hasInlineEffect, mapInlineText } from '../../../../base/slot/utils';
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
    if (this.Component !== ShadRenderer || hasInlineEffect(props.children ?? [])) {
      return null;
    }

    const effect = {
      type: 'shad' as const,
      start: Number(props.start),
      duration: Number(props.duration),
    };

    return mapInlineText(props.children ?? [], (text) => ({ text, effect }));
  }
}
