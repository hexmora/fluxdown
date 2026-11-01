import type { ShadProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';
import { RenderOutlet } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'fluxdown-shad',
  imports: [RenderOutlet],
  template: `<span class="fluxdown-angular-effect-shad-leading"
      ><ng-container [fluxdownRender]="props().leading" /></span
    ><span class="fluxdown-angular-effect-shad-active"
      ><ng-container [fluxdownRender]="props().active" /></span
    ><span
      aria-hidden="true"
      [class]="
        props().isActive
          ? 'fluxdown-angular-effect-shad-mask'
          : 'fluxdown-angular-effect-shad-maskHidden'
      "
      [style.width.px]="props().maskWidth"
      [style.margin-left.px]="-props().maskWidth"
    ></span>`,
  host: { class: 'fluxdown-angular-effect-shad-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShadRenderer {
  readonly props = input.required<ShadProps>();
}
