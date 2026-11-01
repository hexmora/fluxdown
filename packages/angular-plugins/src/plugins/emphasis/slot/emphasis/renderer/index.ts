import type { EmphasisProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-emphasis',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-emphasis-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EmphasisRenderer {
  readonly props = input.required<EmphasisProps>();
}
