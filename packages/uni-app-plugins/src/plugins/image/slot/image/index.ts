import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import ImageRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-image': IPluggableConfig<void>;
  }
}

export class ImageSlotPlugin extends BaseSlotPlugin<'Image'> {
  static readonly key = 'slot-image';

  readonly Component = ImageRenderer;

  readonly type = 'Image';
}
