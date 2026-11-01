import type { ListProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-list',
  template: '<ng-content />',
  host: { class: 'fluxdown-angular-list-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ListRenderer {
  readonly props = input.required<ListProps>();
}
