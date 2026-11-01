import type { CodeBlockProps } from '@fluxdown/angular-plugins/typings';

import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { createTypeOfSlot, RenderOutlet } from '@fluxdown/angular-plugins/base';

import { DIAGRAM_OPTIONS } from './consts';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

let nextId = 0;

@Component({
  selector: 'fluxdown-code-pele',
  imports: [RenderOutlet],
  template: `@if (diagram(); as diagram) {
      <ng-container [fluxdownRender]="header()" />
      <figure
        class="fluxdown-angular-code-pele-canvas"
        [attr.aria-label]="props().meta || 'Diagram'"
        [innerHTML]="diagram"
      ></figure>
      <ng-container [fluxdownRender]="props().suffix" />
    } @else {
      <ng-container [fluxdownRender]="fallback()" />
    }`,
  host: {
    class: 'fluxdown-angular-code-pele-root',
    '[class.fluxdown-angular-code-pele-fallback]': '!diagram()',
    '[style.display]': 'diagram() ? null : "contents"',
    '[attr.aria-busy]': 'props().loading || null',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodePeleRenderer {
  readonly props = input.required<CodeBlockProps>();

  private readonly sanitizer = inject(DomSanitizer);

  private readonly idPrefix = `fluxdown-angular-diagram-${nextId++}`;

  protected readonly diagram = signal<SafeHtml | null>(null);

  protected readonly header = computed(() => {
    const { code, language, meta, onCopy, showHeader = true } = this.props();

    return showHeader ? CodeHeader({ code, language, meta, onCopy }) : null;
  });

  protected readonly fallback = computed(() => {
    const { Raw, ...props } = this.props();

    return Raw?.(props);
  });

  private readonly code = computed(() => this.props().code);

  private readonly language = computed(() => this.props().language?.toLowerCase());

  constructor() {
    effect((cleanup) => {
      const code = this.code();

      const language = this.language();

      let active = true;

      cleanup(() => {
        active = false;
      });

      if (!['mermaid', 'mindmap'].includes(language ?? '') || !code.trim()) {
        this.diagram.set(null);

        return;
      }

      void import('pele/lazy')
        .then(({ renderAsync }) =>
          renderAsync(code, { ...DIAGRAM_OPTIONS, idPrefix: this.idPrefix }),
        )
        .then(({ svg }) => {
          if (active) {
            this.diagram.set(this.sanitizer.bypassSecurityTrustHtml(svg));
          }
        })
        .catch(() => {
          // Keep the last valid diagram while streamed syntax is incomplete.
        });
    });
  }
}
