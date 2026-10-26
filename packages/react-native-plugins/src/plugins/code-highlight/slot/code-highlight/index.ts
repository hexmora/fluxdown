import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeHighlightRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodeHighlightSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeHighlightRenderer;

  readonly type = 'CodeHighlighter';
}
