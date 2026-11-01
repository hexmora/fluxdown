import type { TableProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-table',
  template: '<table><ng-content /></table>',
  host: { class: 'fluxdown-angular-table-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableRenderer {
  readonly props = input.required<TableProps>();
}
