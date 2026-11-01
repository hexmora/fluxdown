import type { SuffixProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-suffix',
  template: `<span
    class="fluxdown-angular-effect-suffix-marker"
    [class.fluxdown-angular-effect-suffix-cursor]="props().type === 'cursor'"
    [class.fluxdown-angular-effect-suffix-dot]="props().type === 'dot'"
    [class.fluxdown-angular-effect-suffix-custom]="
      props().type !== 'cursor' && props().type !== 'dot'
    "
    ><ng-content
  /></span>`,
  host: {
    class: 'fluxdown-angular-effect-suffix-root',
    'aria-hidden': 'true',
    '[attr.data-fluxdown-suffix]': 'props().type',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SuffixRenderer {
  readonly props = input.required<SuffixProps>();
}
