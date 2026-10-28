import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeHighlighterRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SolidSlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodeHighlighterSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeHighlighterRenderer;

  readonly type = 'CodeHighlighter';
}
