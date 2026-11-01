import type { ShadProps } from '@fluxdown/angular-plugins/typings';

import { Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-shad',
  template: '<ng-content />',
  host: {
    class: 'fluxdown-angular-effect-shad-root',
    '[class.fluxdown-angular-effect-shad-active]': 'active()',
    '[style.--fluxdown-angular-shad-duration]': 'props().duration + "ms"',
    '[style.animation-delay]': 'delay() + "ms"',
    'data-fluxdown-shad': 'fade',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShadRenderer {
  readonly props = input.required<ShadProps>();

  private readonly start = computed(() => this.props().start);

  // A negative delay resumes the fade from its own start when the node is re-created.
  protected readonly delay = computed(() => {
    const start = this.start();

    return start >= 0 ? Math.min(0, start - performance.now()) : 0;
  });

  protected readonly active = computed(
    () => this.start() >= 0 && this.delay() > -this.props().duration,
  );
}
