import type { TableCellProps } from '@fluxdown/angular-plugins/typings';

import { Component, input } from '@angular/core';

@Component({
  selector: 'fluxdown-table-cell',
  template: '<ng-content />',
})
export class TableCellRenderer {
  readonly props = input.required<TableCellProps>();
}
