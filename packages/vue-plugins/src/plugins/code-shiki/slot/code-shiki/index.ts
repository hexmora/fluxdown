import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeShikiRenderer } from './renderer';

export * from './renderer';

declare global {
  interface VueSlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodeShikiSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodeShikiRenderer;

  readonly type = 'CodeHighlighter';
}
