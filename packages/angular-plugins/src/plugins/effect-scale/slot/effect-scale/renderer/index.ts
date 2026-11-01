import type { ScaleProps } from '@fluxdown/angular-plugins/typings';

import { Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-effect-scale',
  template: '<span class="fluxdown-angular-effect-scale-glyph"><ng-content /></span>',
  host: {
    class: 'fluxdown-angular-effect-scale-root',
    '[class.fluxdown-angular-effect-scale-active]': 'active()',
    '[style.--fluxdown-angular-scale-duration]': 'props().duration + "ms"',
    '[style.animation-delay]': 'delay() + "ms"',
    '[style.--fluxdown-angular-scale-from]': 'props().from',
    '[style.--fluxdown-angular-scale-blur]': 'props().blur + "em"',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ScaleRenderer {
  readonly props = input.required<ScaleProps>();

  private readonly start = computed(() => this.props().start);

  protected readonly delay = computed(() => {
    const start = this.start();

    return start >= 0 ? Math.min(0, start - performance.now()) : 0;
  });

  protected readonly active = computed(
    () => this.start() >= 0 && this.delay() > -this.props().duration,
  );
}
