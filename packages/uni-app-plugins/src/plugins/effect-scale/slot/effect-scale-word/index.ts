import type { IPluggableConfig } from '@fluxdown/types';

import type { SlotBaseProps } from '../../../../base/slot/type';

import { BaseSlotPlugin } from '../../../../base';
import { ScaleWordRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-scale-word': IPluggableConfig<void>;
  }
}

export class EffectScaleWordSlotPlugin extends BaseSlotPlugin<'ScaleWord'> {
  static readonly key = 'slot-scale-word';

  readonly Component = ScaleWordRenderer;

  readonly type = 'ScaleWord';

  renderInline({ children }: SlotBaseProps & Record<string, unknown>) {
    if (this.Component !== ScaleWordRenderer) {
      return null;
    }

    return children ?? [];
  }
}
