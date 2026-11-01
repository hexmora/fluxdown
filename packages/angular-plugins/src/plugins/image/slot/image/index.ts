import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ImageRenderer } from './renderer';

export class ImageSlotPlugin extends BaseSlotPlugin<'Image'> {
  static readonly key = 'slot-image';

  readonly Component = ImageRenderer;

  readonly type = 'Image';

  readonly tagName = 'img';
}
