import type {
  AngularRenderExtraParams,
  AngularRenderNode,
} from '@fluxdown/angular-plugins/typings';

import { Component, computed, effect, input, signal } from '@angular/core';
import { RenderOutlet } from '@fluxdown/angular-plugins/base';

interface PatchReconcilerProps {
  patchKey: string;

  patches: AngularRenderExtraParams['patches'];

  text?: string;
}

@Component({
  selector: 'fluxdown-patch',
  imports: [RenderOutlet],
  template: '<ng-container [fluxdownRender]="content()" />',
  host: { style: 'display: contents' },
})
export class PatchReconciler {
  readonly props = input.required<PatchReconcilerProps>();

  private readonly patches = signal<AngularRenderExtraParams['patches']['value']>([]);

  protected readonly content = computed<AngularRenderNode>(() => {
    const { patchKey, text } = this.props();

    return this.patches()
      .find(({ key }) => key === patchKey)
      ?.render(text);
  });

  constructor() {
    effect((cleanup) => {
      const { patches } = this.props();

      this.patches.set(patches.value);

      const subscription = patches.subscribe(() => this.patches.set(patches.value));

      cleanup(() => subscription.unsubscribe());
    });
  }
}
