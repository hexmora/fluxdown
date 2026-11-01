import type { OnDestroy, OnInit } from '@angular/core';

import { Component, computed, input, signal } from '@angular/core';

import type { EffectItem } from '../../../src/packs/raw';

import { Fluxdown } from '../../../src/packs/full';

@Component({
  selector: 'story-smooth-streaming',
  imports: [Fluxdown],
  template: `
    <button type="button" (click)="restart()">Replay</button>
    <fluxdown [text]="text()" [build]="{ footnote: true, tex: true }" [streaming]="streaming()" />
  `,
})
export class SmoothStreaming implements OnInit, OnDestroy {
  readonly initialText = input.required<string>();

  readonly effect = input<EffectItem>('scale');

  readonly text = signal('');

  readonly pending = signal(true);

  readonly streaming = computed(
    () => this.pending() && { effect: this.effect(), smooth: this.effect() !== 'chunk' },
  );

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.restart();
  }

  restart() {
    clearInterval(this.timer);

    this.text.set('');

    this.pending.set(true);

    this.timer = setInterval(() => {
      const next = this.initialText().slice(0, this.text().length + 12);

      this.text.set(next);

      if (next === this.initialText()) {
        this.pending.set(false);

        clearInterval(this.timer);
      }
    }, 48);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
