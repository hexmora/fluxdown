import type { CodeHighlighterProps } from '@fluxdown/angular-plugins/typings';

import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { createElement, RenderOutlet } from '@fluxdown/angular-plugins/base';

import { createHighlighted } from './hooks';

@Component({
  selector: 'fluxdown-code-shiki',
  imports: [RenderOutlet],
  template: `<code [class]="'language-' + (props().language ?? 'plaintext')"
    ><ng-container [fluxdownRender]="highlighted() ?? props().code" /><ng-container
      [fluxdownRender]="props().suffix"
  /></code>`,
  host: { class: 'fluxdown-angular-code-shiki-root', tabindex: '0' },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodeShikiRenderer {
  readonly props = input.required<CodeHighlighterProps>();

  private readonly tokens = createHighlighted(() => this.props());

  protected readonly highlighted = computed(() =>
    this.tokens()?.flatMap((line, lineIndex) => [
      lineIndex > 0 ? '\n' : null,
      ...line.map((token) =>
        createElement(
          'span',
          {
            key: token.offset,
            style: {
              color: token.color,
              fontStyle: (token.fontStyle ?? 0) & 1 ? 'italic' : undefined,
              fontWeight: (token.fontStyle ?? 0) & 2 ? 'bold' : undefined,
              textDecoration: (token.fontStyle ?? 0) & 4 ? 'underline' : undefined,
            },
          },
          token.content,
        ),
      ),
    ]),
  );
}
