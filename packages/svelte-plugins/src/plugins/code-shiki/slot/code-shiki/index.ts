import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeShikiRenderer } from './code-shiki-renderer';

export * from './code-shiki-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodeShikiSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeShikiRenderer;

  readonly type = 'CodeHighlighter';
}
