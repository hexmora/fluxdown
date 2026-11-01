import type { AfterViewInit, OnDestroy } from '@angular/core';
import type { AngularRenderNode } from '@fluxdown/angular-plugins/typings';

import { Directive, effect, ElementRef, inject, input } from '@angular/core';

import type { RenderRange } from '../renderer';

import { AngularDomRenderer } from '../renderer';

@Directive({ selector: '[fluxdownRender]', standalone: true })
export class RenderOutlet implements AfterViewInit, OnDestroy {
  readonly value = input<AngularRenderNode>(undefined, { alias: 'fluxdownRender' });

  private readonly element = inject<ElementRef<Node>>(ElementRef);

  private readonly renderer = inject(AngularDomRenderer);

  private range?: RenderRange;

  constructor() {
    effect(() => {
      const value = this.value();

      this.range?.update(value);
    });
  }

  ngAfterViewInit() {
    const anchor = this.element.nativeElement;

    if (anchor.nodeType === 8 && anchor.parentNode) {
      this.range = this.renderer.createRange(anchor.parentNode, anchor);
    } else {
      this.range = this.renderer.createRange(anchor);
    }

    this.range.update(this.value());
  }

  ngOnDestroy() {
    this.range?.destroy();
  }
}
