import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodePrismRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-code-highlighter': IPluggableConfig<void>;
  }
}

export class CodePrismSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-highlighter';

  readonly Component = CodePrismRenderer;

  readonly type = 'CodeHighlighter';
}
