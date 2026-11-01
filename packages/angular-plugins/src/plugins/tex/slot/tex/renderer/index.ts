import type { TexProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-tex',
  template: '{{ props().tex }}',
  host: {
    class: 'fluxdown-angular-tex-root',
    '[attr.data-mode]': 'props().mode ?? "inline"',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TexRenderer {
  readonly props = input.required<TexProps>();
}
