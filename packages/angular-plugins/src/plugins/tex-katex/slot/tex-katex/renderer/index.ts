import type { TexProps } from '@fluxdown/angular-plugins/typings';

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

@Component({
  selector: 'fluxdown-tex-katex',
  template: '',
  host: {
    class: 'fluxdown-angular-tex-katex-root',
    '[innerHTML]': 'content()',
    '[attr.data-mode]': 'props().mode ?? "inline"',
    '[attr.data-tex]': 'props().tex',
    '[attr.data-formula-error]': 'failed() || null',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TexKatexRenderer {
  readonly props = input.required<TexProps>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly content = signal<SafeHtml | string>('');

  protected readonly failed = signal(false);

  private readonly tex = computed(() => this.props().tex);

  private readonly mode = computed(() => this.props().mode ?? 'inline');

  constructor() {
    effect((cleanup) => {
      const tex = this.tex();

      const mode = this.mode();

      let active = true;

      cleanup(() => {
        active = false;
      });

      const fallback = tex.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

      this.content.set(fallback);

      void this.render(tex, mode)
        .then((html) => {
          if (!active) {
            return;
          }

          this.failed.set(html === null);

          this.content.set(html === null ? fallback : this.sanitizer.bypassSecurityTrustHtml(html));
        })
        .catch(() => {
          if (active) {
            this.failed.set(true);
          }
        });
    });
  }

  protected async render(tex: string, mode: 'inline' | 'display') {
    const { katexTexToHtml } = await import('./utils');

    return katexTexToHtml(tex, mode);
  }
}
