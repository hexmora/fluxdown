import type { BreakLineProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-break-line',
  template: '',
  host: { class: 'fluxdown-angular-break-line-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BreakLineRenderer {
  readonly props = input.required<BreakLineProps>();
}
