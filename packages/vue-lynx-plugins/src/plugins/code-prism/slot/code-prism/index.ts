import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodePrismRenderer } from './renderer';

declare global {
  interface VueSlotConfigs {
    'slot-code-prism': IPluggableConfig<void>;
  }
}

export class CodePrismSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-prism';

  readonly Component = CodePrismRenderer;

  readonly type = 'CodeHighlighter';
}
