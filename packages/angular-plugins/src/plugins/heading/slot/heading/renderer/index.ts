import type { HeadingProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-heading',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-heading-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeadingRenderer {
  readonly props = input.required<HeadingProps>();
}
