import { Component, ViewEncapsulation } from '@angular/core';
import { TexKatexRenderer } from '@fluxdown/angular-plugins/plugins/tex-katex';

@Component({
  selector: 'fluxdown-tex-mathjax-katex',
  template: '',
  host: {
    class: 'fluxdown-angular-tex-mathjax-katex-root',
    '[innerHTML]': 'content()',
    '[attr.data-mode]': 'props().mode ?? "inline"',
    '[attr.data-tex]': 'props().tex',
    '[attr.data-formula-error]': 'failed() || null',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TexMathjaxKatexRenderer extends TexKatexRenderer {
  protected override async render(tex: string, mode: 'inline' | 'display') {
    const html = await super.render(tex, mode);

    if (html !== null) {
      return html;
    }

    const { texToSvg } = await import('./utils');

    return texToSvg(tex, mode);
  }
}
