import type { StrongProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-strong',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-strong-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class StrongRenderer {
  readonly props = input.required<StrongProps>();
}
