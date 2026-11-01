import type { CodeBlockProps } from '@fluxdown/angular-plugins/typings';

import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { createTypeOfSlot, RenderOutlet } from '@fluxdown/angular-plugins/base';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const CodeHighlighter = /*#__PURE__*/ createTypeOfSlot('CodeHighlighter');

@Component({
  selector: 'fluxdown-code-block',
  imports: [RenderOutlet],
  template: '<ng-container [fluxdownRender]="content()" />',
  host: {
    class: 'fluxdown-angular-code-block-root',
    '[attr.aria-busy]': 'props().loading || null',
  },
  styleUrl: './index.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodeBlockRenderer {
  readonly props = input.required<CodeBlockProps>();

  protected readonly content = computed(() => {
    const { code, language, meta, onCopy, showHeader = true, suffix } = this.props();

    return [
      showHeader ? CodeHeader({ code, language, meta, onCopy }) : null,
      CodeHighlighter({ code, language, meta, suffix }),
    ];
  });
}
