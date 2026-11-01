import type { BlockquoteProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-blockquote',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-blockquote-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BlockquoteRenderer {
  readonly props = input.required<BlockquoteProps>();
}
