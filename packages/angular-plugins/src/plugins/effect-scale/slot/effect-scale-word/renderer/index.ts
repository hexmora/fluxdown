import type { ScaleWordProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-scale-word',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-effect-scale-word-word' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ScaleWordRenderer {
  readonly props = input.required<ScaleWordProps>();
}
