import type { ChunkProps } from '@fluxdown/angular-plugins/typings';

import { Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fluxdown-effect-chunk',
  template: '<ng-content />',
  host: {
    class: 'fluxdown-angular-effect-chunk-root',
    '[class.fluxdown-angular-effect-chunk-active]': 'active()',
    '[style.--fluxdown-angular-chunk-duration]': 'props().duration + "ms"',
    '[style.animation-delay]': 'delay() + "ms"',
    'data-fluxdown-chunk': '1',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChunkRenderer {
  readonly props = input.required<ChunkProps>();

  private readonly start = computed(() => this.props().start);

  protected readonly delay = computed(() => {
    const start = this.start();

    return start >= 0 ? Math.min(0, start - performance.now()) : 0;
  });

  protected readonly active = computed(
    () => this.start() >= 0 && this.delay() > -this.props().duration,
  );
}
