import type { ImageProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';
import { normalizePublicUrl } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'fluxdown-image',
  template: '',
  host: {
    class: 'fluxdown-angular-image-root',
    '[attr.src]': 'url()',
    '[attr.alt]': 'props().alt ?? ""',
    '(click)': 'props().onClick?.({ event: $event })',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ImageRenderer {
  readonly props = input.required<ImageProps>();

  protected url() {
    return normalizePublicUrl(this.props().src);
  }
}
