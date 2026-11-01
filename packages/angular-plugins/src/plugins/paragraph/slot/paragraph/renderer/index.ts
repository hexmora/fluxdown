import type { ParagraphProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-paragraph',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-paragraph-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ParagraphRenderer {
  readonly props = input.required<ParagraphProps>();
}
