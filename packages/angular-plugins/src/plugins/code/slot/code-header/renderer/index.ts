import type { CodeHeaderProps } from '@fluxdown/angular-plugins/typings';

import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { createElement, RenderOutlet } from '@fluxdown/angular-plugins/base';
import { CodeHeaderInnerActionKey } from '@fluxdown/angular-plugins/typings';

import { COPY_FEEDBACK_MS } from './consts';
import { copyText } from './utils';

@Component({
  selector: 'fluxdown-code-header',
  imports: [RenderOutlet],
  template: `<div class="fluxdown-angular-code-header-language">
      <ng-container [fluxdownRender]="props().left ?? props().language ?? 'text'" />
    </div>
    <div class="fluxdown-angular-code-header-actions">
      <ng-container [fluxdownRender]="actions()" />
    </div>`,
  host: { class: 'fluxdown-angular-code-header-root' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodeHeaderRenderer {
  readonly props = input.required<CodeHeaderProps>();

  private readonly state = signal<'copying' | 'copied' | null>(null);

  private timer?: ReturnType<typeof setTimeout>;

  private request = 0;

  protected readonly actions = computed(() => {
    const copied = this.state() === 'copied';

    const copy = {
      key: CodeHeaderInnerActionKey.Copy,
      target: createElement(
        'button',
        {
          'aria-label': copied ? 'Copied' : 'Copy',
          'aria-live': 'polite',
          disabled: this.state() === 'copying',
          onClick: () => void this.copy(),
          type: 'button',
        },
        [
          createElement(
            'svg',
            {
              'aria-hidden': 'true',
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '1.75',
              viewBox: '0 0 24 24',
            },
            copied
              ? createElement('path', { d: 'm5 12 4 4L19 6' })
              : [
                  createElement('rect', { height: 13, rx: 2, width: 13, x: 8, y: 8 }),
                  createElement('path', {
                    d: 'M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3',
                  }),
                ],
          ),
          copied ? 'Copied' : 'Copy',
        ],
      ),
    };

    const actions = this.props().actions;

    return (typeof actions === 'function' ? actions([copy]) : [copy, ...(actions ?? [])]).map(
      ({ target }) => target,
    );
  });

  private readonly code = computed(() => this.props().code);

  private readonly language = computed(() => this.props().language);

  private readonly meta = computed(() => this.props().meta);

  constructor() {
    effect(() => {
      this.code();

      this.language();

      this.meta();

      this.reset();
    });

    inject(DestroyRef).onDestroy(() => this.reset());
  }

  private reset() {
    this.request += 1;

    this.state.set(null);

    clearTimeout(this.timer);
  }

  private async copy() {
    if (this.state() === 'copying') {
      return;
    }

    const request = ++this.request;

    const { code, language, meta, onCopy } = this.props();

    this.state.set('copying');

    const copied = await copyText(code).catch(() => false);

    if (request !== this.request) {
      return;
    }

    this.state.set(copied ? 'copied' : null);

    if (copied) {
      this.timer = setTimeout(() => this.reset(), COPY_FEEDBACK_MS);

      onCopy?.({ code, language, meta });
    }
  }
}
