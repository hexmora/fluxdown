import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodePrismRenderer } from './code-prism-renderer';

export * from './code-prism-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodePrismSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodePrismRenderer;

  readonly type = 'CodeHighlighter';
}
