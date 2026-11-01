import type { IPluggableConfig } from '@fluxdown/types';

import type { SlotBaseProps } from '../../../../base/slot/type';

import { BaseSlotPlugin } from '../../../../base';
import { hasInlineEffect, mapInlineText } from '../../../../base/slot/utils/inline';
import { ChunkRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-chunk': IPluggableConfig<void>;
  }
}

export class EffectChunkSlotPlugin extends BaseSlotPlugin<'Chunk'> {
  static readonly key = 'slot-chunk';

  readonly Component = ChunkRenderer;

  readonly type = 'Chunk';

  renderInline(props: SlotBaseProps & Record<string, unknown>) {
    if (this.Component !== ChunkRenderer || hasInlineEffect(props.children ?? [])) {
      return null;
    }

    const effect = {
      type: 'chunk' as const,
      start: Number(props.start),
      duration: Number(props.duration),
    };

    return mapInlineText(props.children ?? [], (text) => ({ text, effect }));
  }
}
