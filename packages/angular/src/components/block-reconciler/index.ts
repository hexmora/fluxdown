import type { AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import type { RenderRange } from '@fluxdown/angular-plugins/base';
import type { Subscription } from 'rxjs';

import { Directive, effect, ElementRef, inject, input, untracked } from '@angular/core';
import { AngularDomRenderer, getAngularProps, RenderContext } from '@fluxdown/angular-plugins/base';
import { toState } from 'stative';

import type { BlockReconcilerProps } from './type';

import { renderParentChildren } from './utils';

export * from './type';

@Directive({ selector: '[fluxdownBlock]' })
export class BlockReconciler implements AfterViewInit, OnChanges, OnDestroy {
  readonly props = input.required<BlockReconcilerProps>({ alias: 'fluxdownBlock' });

  private readonly element = inject<ElementRef<Comment>>(ElementRef);

  private readonly renderer = inject(AngularDomRenderer);

  private readonly subscriptions: Subscription[] = [];

  private range?: RenderRange;

  private readonly context = inject(RenderContext);

  constructor() {
    effect(() => {
      this.context.slots();

      untracked(() => this.update());
    });
  }

  ngAfterViewInit() {
    const anchor = this.element.nativeElement;

    this.range = this.renderer.createRange(anchor.parentNode!, anchor);

    this.connect();
  }

  ngOnChanges() {
    if (this.range) {
      this.connect();
    }
  }

  ngOnDestroy() {
    this.disconnect();

    this.range?.destroy();
  }

  private connect() {
    this.disconnect();

    const { block, patches: sourcePatches, plugins: sourcePlugins } = this.props();

    const patches = toState(sourcePatches);

    const plugins = toState(sourcePlugins);

    let ready = false;

    const update = () => {
      if (ready) {
        this.update();
      }
    };

    this.subscriptions.push(
      block.value.subscribe(update),
      patches.subscribe(update),
      plugins.subscribe(update),
    );

    ready = true;

    update();
  }

  private update() {
    if (!this.range) {
      return;
    }

    const { block, patches, plugins } = this.props();

    const root = block.value.value;

    this.range.update(
      renderParentChildren(root, [root], toState(patches), toState(plugins).value, getAngularProps),
    );
  }

  private disconnect() {
    for (const subscription of this.subscriptions.splice(0)) {
      subscription.unsubscribe();
    }
  }
}
