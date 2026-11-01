import type { CodeHighlighterProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';
import { RenderOutlet } from '@fluxdown/angular-plugins/base';

import { createHighlighted } from './hooks';

@Component({
  selector: 'fluxdown-code-prism',
  imports: [RenderOutlet],
  template: `<code [class]="'language-' + (props().language ?? 'plaintext')"
    ><ng-container [fluxdownRender]="highlighted() ?? props().code" /><ng-container
      [fluxdownRender]="props().suffix"
  /></code>`,
  host: { class: 'fluxdown-angular-code-prism-root', tabindex: '0' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodePrismRenderer {
  readonly props = input.required<CodeHighlighterProps>();

  protected readonly highlighted = createHighlighted(() => this.props());
}
