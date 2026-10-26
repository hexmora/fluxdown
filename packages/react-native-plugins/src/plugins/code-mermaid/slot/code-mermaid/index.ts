import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeMermaidRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-code-mermaid': IPluggableConfig<void>;
  }
}

export class CodeMermaidSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-mermaid';

  readonly Component = CodeMermaidRenderer;

  readonly type = 'CodeBlock';
}
