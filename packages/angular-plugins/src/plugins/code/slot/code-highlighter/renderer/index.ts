import type { AngularRenderNode, CodeHighlighterProps } from '@fluxdown/angular-plugins/typings';

import { Component, input, ViewEncapsulation } from '@angular/core';
import { RenderOutlet } from '@fluxdown/angular-plugins/base';

@Component({
  selector: 'fluxdown-code-highlighter',
  imports: [RenderOutlet],
  template: `<code [class]="'language-' + (props().language ?? 'plaintext')"
    ><ng-container [fluxdownRender]="props().children ?? props().code" /><ng-container
      [fluxdownRender]="props().suffix"
  /></code>`,
  host: { class: 'fluxdown-angular-code-highlighter-root', tabindex: '0' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodeHighlighterRenderer {
  readonly props = input.required<CodeHighlighterProps & { children?: AngularRenderNode }>();
}
