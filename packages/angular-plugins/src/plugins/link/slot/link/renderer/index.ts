import type { LinkProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';
import { normalizePublicUrl } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'fluxdown-link',
  template: '<ng-content />',
  host: {
    class: 'fluxdown-angular-link-root',
    '[attr.href]': 'url()',

    '(click)': 'props().onClick?.({ event: $event })',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LinkRenderer {
  readonly props = input.required<LinkProps>();

  protected url() {
    return normalizePublicUrl(this.props().href, { allowHash: true, allowMailto: true });
  }
}
