import type { ElementProps } from '@fluxdown/angular-plugins/typings';

import { Component, input } from '@angular/core';

@Component({
  selector: 'fluxdown-element',
  template: '<ng-content />',
})
export class ElementRenderer {
  readonly props = input.required<ElementProps>();
}
